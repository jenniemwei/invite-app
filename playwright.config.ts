import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://localhost:3101", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3101",
    url: "http://localhost:3101",
    reuseExistingServer: false,
    env: { DATA_MODE: "local", DEMO_DATA_DIR: ".data-e2e" },
    timeout: 120000,
  },
});
