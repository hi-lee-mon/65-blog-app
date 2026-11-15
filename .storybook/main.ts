import { defineMain } from "@storybook/nextjs-vite/node";

export default defineMain({
  framework: "@storybook/nextjs-vite",
  stories: [
    { directory: "../app/_components", files: "**/*.stories.tsx", titlePrefix: "Components" },
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  core: { disableTelemetry: true },
});
