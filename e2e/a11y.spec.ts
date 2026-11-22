import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// axe の規則のうち、WCAG 2.2 の A と AA に当たるものだけを使う
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// 一覧ページから記事とタグのページをたどるので、ここには入口だけを書く
const ENTRY_PATHS = ["/", "/posts", "/notes", "/tags", "/design-system"];
const LIST_PATHS = ["/posts", "/tags"];

async function collectPaths(page: Page) {
  const paths = new Set(ENTRY_PATHS);
  for (const listPath of LIST_PATHS) {
    await page.goto(listPath);
    const hrefs = await page
      .locator("main a[href^='/']")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    for (const href of hrefs) paths.add(href);
  }
  return [...paths].sort();
}

async function findViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target.join(" "),
      summary: node.failureSummary,
    })),
  }));
}

test("サイト内のページに WCAG 2.2 AA の違反がない", async ({ page }) => {
  const paths = await collectPaths(page);
  for (const path of paths) {
    await test.step(path, async () => {
      await page.goto(path);
      expect.soft(await findViolations(page), path).toEqual([]);
    });
  }
});
