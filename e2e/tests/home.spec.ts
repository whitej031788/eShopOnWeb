import { test, expect } from '@playwright/test';

test.describe('Storefront home / catalog', () => {
  test('home page loads with the catalog', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Catalog/i);
  });

  test('catalog shows products with prices and an add-to-basket action', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.esh-catalog-item');
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);

    const firstCard = items.first();
    await expect(firstCard.locator('.esh-catalog-name span')).not.toBeEmpty();
    await expect(firstCard.locator('.esh-catalog-price span')).not.toBeEmpty();
    await expect(firstCard.locator('input[value="[ ADD TO BASKET ]"]')).toBeVisible();
  });

  test('brand and type filters are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('select.esh-catalog-filter')).toHaveCount(2);
  });
});
