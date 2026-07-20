import { test, expect } from '@playwright/test';
import { login, addFirstProductToBasket } from './helpers';

test.describe('Order history', () => {
  test('a placed order shows up in My Orders and on its detail page', async ({ page }) => {
    await login(page);
    const productName = await addFirstProductToBasket(page);

    // Basket -> Checkout -> place the order.
    await page.getByRole('link', { name: /Checkout/i }).click();
    await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
    await page.locator('input[value="[ Pay Now ]"]').click();
    await expect(page).toHaveURL(/Success/i);

    // Open the order history from the identity dropdown in the header
    // (revealed by hovering the name section).
    await page.locator('.esh-identity-section').first().hover();
    await page.getByRole('link', { name: /My orders/i }).click();
    await expect(page).toHaveURL(/order\/my-orders/i);

    // At least one order is listed.
    const orderRows = page.locator('.esh-orders-items');
    await expect(orderRows.first()).toBeVisible();
    expect(await orderRows.count()).toBeGreaterThan(0);

    // Drill into the most recent order and confirm the product is on the detail page.
    await orderRows.first().getByRole('link', { name: /Detail/i }).click();
    await expect(page).toHaveURL(/order\/detail/i);
    await expect(page.getByText('ORDER DETAILS')).toBeVisible();
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible();
  });
});
