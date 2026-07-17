import { test, expect } from '@playwright/test';
import { addFirstProductToBasket } from './helpers';

test.describe('Basket', () => {
  test('a guest can add a product to the basket', async ({ page }) => {
    const productName = await addFirstProductToBasket(page);

    // The basket lists the product we just added and shows a total.
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByRole('link', { name: /Checkout/i })).toBeVisible();
  });

  test('quantity input is editable on the basket page', async ({ page }) => {
    await addFirstProductToBasket(page);
    const qty = page.locator('input.esh-basket-input').first();
    await expect(qty).toBeVisible();
    await qty.fill('3');
    await page.getByRole('button', { name: /Update/i }).click();
    await expect(page.locator('input.esh-basket-input').first()).toHaveValue('3');
  });
});
