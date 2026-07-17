import { test, expect } from '@playwright/test';

test.describe('Catalog filtering', () => {
  test('filtering by brand reloads the catalog with the filter applied', async ({ page }) => {
    await page.goto('/');

    const brandSelect = page.locator('select.esh-catalog-filter').first();
    // Pick the second option (first real brand after the "All" placeholder).
    const brandValue = await brandSelect.locator('option').nth(1).getAttribute('value');
    await brandSelect.selectOption(brandValue!);

    await page.locator('input.esh-catalog-send').click();

    // The GET form pushes the selected brand into the query string.
    await expect(page).toHaveURL(new RegExp(`BrandFilterApplied=${brandValue}`, 'i'));
    // The chosen brand stays selected after reload.
    await expect(page.locator('select.esh-catalog-filter').first()).toHaveValue(brandValue!);
  });
});
