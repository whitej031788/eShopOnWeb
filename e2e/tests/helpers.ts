import { expect, type Page } from '@playwright/test';

/** Seeded demo accounts (see src/Web/Areas/Identity/Pages/Account/Login.cshtml). */
export const DEMO_USER = { email: 'demouser@microsoft.com', password: 'Pass@word1' };
export const ADMIN_USER = { email: 'admin@microsoft.com', password: 'Pass@word1' };

/** Log in through the storefront UI and assert we end up authenticated. */
export async function login(page: Page, user = DEMO_USER): Promise<void> {
  await page.goto('/Identity/Account/Login');
  await page.locator('#Input_Email').fill(user.email);
  await page.locator('#Input_Password').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  // The header shows the signed-in user's name once authenticated.
  await expect(page.locator('.esh-identity-name').first()).toBeVisible();
}

/**
 * Add the first catalog item on the home page to the basket.
 * Returns the product name so callers can assert on it later.
 */
export async function addFirstProductToBasket(page: Page): Promise<string> {
  await page.goto('/');
  const firstCard = page.locator('.esh-catalog-item').first();
  await expect(firstCard).toBeVisible();
  const name = (await firstCard.locator('.esh-catalog-name span').innerText()).trim();
  await firstCard.locator('input[value="[ ADD TO BASKET ]"]').click();
  await expect(page).toHaveURL(/\/Basket/i);
  return name;
}
