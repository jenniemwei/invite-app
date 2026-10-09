import { test, expect } from "@playwright/test";
test("host creates two personal invitations; phone responds; host sees the correct headcount", async ({
  page,
  browser,
}) => {
  await page.goto("/host");
  await page
    .getByRole("link", { name: "Create invitation", exact: true })
    .click();
  await page.getByRole("button", { name: "Fill with sample details" }).click();
  await page.getByLabel("Event title").fill("Dinner at mine");
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your guests" }),
  ).toBeVisible();
  const eventURL = page.url();
  await page.getByRole("button", { name: "Fill sample guest" }).click();
  await page.getByRole("button", { name: "Create guest invitation" }).click();
  await expect(
    page.getByRole("heading", { name: "A little note for Jamie." }),
  ).toBeVisible();
  const jamieLink = await page
    .getByRole("link", { name: "Open guest experience" })
    .getAttribute("href");
  await page.goto(eventURL);
  await page.getByLabel("Guest name", { exact: true }).fill("Sam");
  await page
    .getByLabel("A note just for them")
    .fill("Sam, bring your stories.");
  await page.getByRole("button", { name: "Create guest invitation" }).click();
  const samLink = await page
    .getByRole("link", { name: "Open guest experience" })
    .getAttribute("href");
  expect(samLink).not.toBe(jamieLink);
  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const guest = await phone.newPage();
  await guest.goto(`http://localhost:3101${jamieLink}`);
  await expect(guest.getByText("Invitation for Jamie")).toBeVisible();
  await guest.screenshot({
    path: "verification/guest-mobile.png",
    fullPage: true,
  });
  await guest.getByRole("radio", { name: "I need time" }).check();
  await guest
    .getByLabel("When can you get back to them?")
    .fill(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  await guest.getByRole("button", { name: "Confirm response" }).click();
  await expect(
    guest.getByRole("heading", { name: "A little breathing room." }),
  ).toBeVisible();
  await guest
    .getByRole("button", { name: "View invitation or change response" })
    .click();
  await guest.getByRole("radio", { name: "Yes, I’ll be there" }).check();
  await guest.getByRole("button", { name: "Confirm response" }).click();
  await expect(
    guest.getByRole("heading", { name: "There’s a place for you." }),
  ).toBeVisible();
  await guest.reload();
  await expect(
    guest.getByRole("heading", { name: "There’s a place for you." }),
  ).toBeVisible();
  await page.goto(eventURL);
  await expect(page.locator(".stat-yes strong")).toHaveText("1");
  await expect(page.locator(".stat-unanswered strong")).toHaveText("1");
  await page.screenshot({
    path: "verification/host-overview.png",
    fullPage: true,
  });
  await guest.goto(`http://localhost:3101${samLink}`);
  await expect(guest.getByText("Sam, bring your stories.")).toBeVisible();
  await expect(guest.getByText("Invitation for Jamie")).toHaveCount(0);
  await guest.getByRole("radio", { name: "I can’t attend" }).check();
  await guest.getByRole("button", { name: "Confirm response" }).click();
  await expect(
    guest.getByRole("heading", { name: "Thanks for letting them know." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".stat-no strong")).toHaveText("1");
  await expect(page.locator(".stat-yes strong")).toHaveText("1");
  await guest.goto("http://localhost:3101/i/invalid");
  await expect(
    guest.getByRole("heading", { name: "We couldn’t open this invitation." }),
  ).toBeVisible();
  await expect(guest.locator(".error-notice")).toContainText("not valid");
  await phone.close();
});
