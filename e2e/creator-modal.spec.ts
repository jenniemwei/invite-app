import { test, expect } from "@playwright/test";

test("creator modal closes, contains focus, and fits the phone preview", async ({
  page,
}) => {
  await page.goto("/host");
  await page
    .getByRole("link", { name: "Create invitation", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Create invitation" });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByText("Start with a plan", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      "The details are shared. Each invitation gets a personal touch.",
    ),
  ).toHaveCount(0);
  expect(await page.locator("#app-viewport").evaluate((el) => el.inert)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Close invitation creator" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Create event", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close invitation creator" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL("/host");
  await expect(dialog).toHaveCount(0);
  expect(await page.locator("#app-viewport").evaluate((el) => el.inert)).toBe(
    false,
  );

  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await page
    .getByRole("link", { name: "Create invitation", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  await page.reload();
  await expect(dialog).toBeVisible();
  const frame = await page.locator(".device-frame").boundingBox();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThan(frame!.x);
  expect(bounds!.y).toBeGreaterThan(frame!.y);
  expect(bounds!.x + bounds!.width).toBeLessThan(frame!.x + frame!.width);
  expect(bounds!.y + bounds!.height).toBeLessThan(frame!.y + frame!.height);
  expect(
    await page
      .locator(".creator-body")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.getByRole("button", { name: "Close invitation creator" }).click();
  await expect(page).toHaveURL("/host");
  await expect(dialog).toHaveCount(0);
});
