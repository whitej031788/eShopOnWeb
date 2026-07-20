import { test, expect } from '@playwright/test';
import { addFirstProductToBasket } from './helpers';

test.describe('Catalog navigation', () => {
  test('filtering by type reloads the catalog with the type filter applied', async ({ page }) => {
    await page.goto('/');

    // The catalog has two filter dropdowns: brand (first) and type (second).
    const typeSelect = page.locator('select.esh-catalog-filter').nth(1);
    const typeValue = await typeSelect.locator('option').nth(1).getAttribute('value');
    await typeSelect.selectOption(typeValue!);
    await page.locator('input.esh-catalog-send').click();

    // The GET form pushes the selected type into the query string and keeps it selected.
    await expect(page).toHaveURL(new RegExp(`TypesFilterApplied=${typeValue}`, 'i'));
    await expect(page.locator('select.esh-catalog-filter').nth(1)).toHaveValue(typeValue!);
  });

  test('pagination advances to the next page of the catalog', async ({ page }) => {
    await page.goto('/');

    const pager = page.locator('.esh-pager-item', { hasText: /Showing/i }).first();
    await expect(pager).toContainText(/Page 1/i);

    await page.locator('a#Next').first().click();

    await expect(page).toHaveURL(/pageId=1/i);
    await expect(page.locator('.esh-pager-item', { hasText: /Showing/i }).first()).toContainText(/Page 2/i);
  });

  test('the header basket status reflects the basket and links to it', async ({ page }) => {
    const productName = await addFirstProductToBasket(page);

    // Back on the catalog, the header badge shows a non-zero count.
    await page.goto('/');
    await expect(page.locator('.esh-basketstatus-badge').first()).toHaveText(/[1-9]/);

    // Clicking the basket status navigates to the basket with our product listed.
    await page.locator('a.esh-basketstatus').first().click();
    await expect(page).toHaveURL(/Basket/i);
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible();
  });
});
