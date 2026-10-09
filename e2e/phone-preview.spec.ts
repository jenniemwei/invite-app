import { test, expect } from "@playwright/test";

test("phone preview preserves forms, uses mobile layouts, and stays on across navigation and refresh", async ({
  page,
}) => {
  await page.goto("/host/events/new");
  await page.getByLabel("Event title").fill("Keep this draft");
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Phone", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Event title")).toHaveValue("Keep this draft");
  const viewport = page.locator("#app-viewport");
  expect(await viewport.evaluate((el) => el.clientWidth)).toBe(402);
  expect(
    await page
      .locator(".device-frame")
      .evaluate((el) => ({ width: el.clientWidth, height: el.clientHeight })),
  ).toEqual({ width: 402, height: 874 });
  const frame = await page.locator(".device-frame").boundingBox();
  expect(frame!.width / frame!.height).toBeCloseTo(422 / 894, 3);
  expect(
    await page
      .locator(".form-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(1);
  await page.getByRole("button", { name: "Desktop", exact: true }).click();
  await expect(page.getByLabel("Event title")).toHaveValue("Keep this draft");
  expect((await viewport.boundingBox())!.width).toBeGreaterThan(700);
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await page.getByRole("button", { name: "Fill with sample details" }).click();
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your guests" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Phone", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page
      .locator(".workspace-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(1);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Phone", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await viewport.evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.goto("/i/invalid");
  await expect(
    page.getByRole("heading", { name: "We couldn’t open this invitation." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Phone", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Desktop", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Desktop", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
