import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
  },
  projects: [
    {
      name: "light",
      use: { ...devices["Desktop Chrome"], colorScheme: "light" },
    },
    {
      name: "dark",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
    },
    {
      name: "mobile-light",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 700 },
        colorScheme: "light",
      },
    },
    {
      name: "mobile-dark",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 700 },
        colorScheme: "dark",
      },
    },
  ],
  webServer: {
    command: "bun run s -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
  },
});
