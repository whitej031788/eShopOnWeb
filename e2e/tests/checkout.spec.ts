import { test, expect } from '@playwright/test';
import { login, addFirstProductToBasket } from './helpers';

test.describe('Checkout', () => {
  test('a logged-in user can place an order end to end', async ({ page }) => {
    await login(page);
    const productName = await addFirstProductToBasket(page);

    // Basket -> Checkout review page.
    await page.getByRole('link', { name: /Checkout/i }).click();
    await expect(page).toHaveURL(/Checkout/i);
    await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible();

    // Pay Now submits the order.
    await page.locator('input[value="[ Pay Now ]"]').click();

    // Lands on the order success page.
    await expect(page).toHaveURL(/Success/i);
  });
});
