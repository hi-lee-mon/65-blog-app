import type { ESTree, Plugin, Rule } from "@oxlint/plugins";

// オブジェクトの中に `outer: { inner: ... }` があるかを調べる
function hasNestedKey(objectNode: ESTree.ObjectExpression, outer: string, inner: string): boolean {
  return objectNode.properties.some(
    (property) =>
      property.type === "Property" &&
      property.key.type === "Identifier" &&
      property.key.name === outer &&
      property.value.type === "ObjectExpression" &&
      property.value.properties.some(
        (child) =>
          child.type === "Property" && child.key.type === "Identifier" && child.key.name === inner,
      ),
  );
}

// metadata か generateMetadata に `outer.inner` を書いているかを確かめるルールを作る
function createRequireRule(outer: string, inner: string): Rule {
  const keyPath = `${outer}.${inner}`;

  return {
    create(context) {
      let metadataFound = false;
      // generateMetadata の中にいる間だけ true
      let insideGenerateMetadata = false;
      let keyReturned = false;

      return {
        // export const metadata = { ... }
        "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
          node: ESTree.VariableDeclarator,
        ) {
          if (node.id.type !== "Identifier" || node.id.name !== "metadata") return;
          metadataFound = true;
          if (node.init?.type === "ObjectExpression" && hasNestedKey(node.init, outer, inner)) {
            return;
          }
          context.report({ message: `metadata に ${keyPath} がありません`, node });
        },

        // export async function generateMetadata() { return { ... } }
        "ExportNamedDeclaration > FunctionDeclaration"(node: ESTree.Function) {
          if (node.id?.name !== "generateMetadata") return;
          metadataFound = true;
          insideGenerateMetadata = true;
          keyReturned = false;
        },

        ReturnStatement(node) {
          if (!insideGenerateMetadata) return;
          if (
            node.argument?.type === "ObjectExpression" &&
            hasNestedKey(node.argument, outer, inner)
          ) {
            keyReturned = true;
          }
        },

        "ExportNamedDeclaration > FunctionDeclaration:exit"(node: ESTree.Function) {
          if (node.id?.name !== "generateMetadata") return;
          insideGenerateMetadata = false;
          if (keyReturned) return;
          context.report({
            message: `generateMetadata が ${keyPath} を返していません`,
            node: node.id,
          });
        },

        "Program:exit"(node) {
          if (metadataFound) return;
          context.report({
            message: `metadata も generateMetadata もないので、${keyPath} を確かめられません`,
            node,
          });
        },
      };
    },
  };
}

export default {
  meta: { name: "nextjs-metadata" },
  rules: {
    "require-canonical": createRequireRule("alternates", "canonical"),
    "require-og-url": createRequireRule("openGraph", "url"),
  },
} satisfies Plugin;
