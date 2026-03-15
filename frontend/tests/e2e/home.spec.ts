import { expect, test } from "@playwright/test";

test("homepage renders studio sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Launch studio")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shape the atmosphere" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Live sculpting controls" })).toBeVisible();
});
