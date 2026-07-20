import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test('a new user can register, is signed in, then can log out', async ({ page }) => {
    // Unique email per run so the account never collides with a previous run.
    const email = `pw-user-${Date.now()}@example.com`;
    const password = 'Pass@word1';

    await page.goto('/Identity/Account/Register');
    await page.locator('#Input_Email').fill(email);
    await page.locator('#Input_Password').fill(password);
    await page.locator('#Input_ConfirmPassword').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Registering signs the user in and redirects back to the storefront.
    await expect(page).not.toHaveURL(/Register/i);
    await expect(page.locator('.esh-identity-name').first()).toContainText(email);

    // Log out via the identity dropdown (revealed by hovering the name section) and confirm we're anonymous.
    await page.locator('.esh-identity-section').first().hover();
    await page.getByRole('link', { name: /Log Out/i }).click();
    await expect(page.locator('.esh-identity-name').first()).toHaveText(/Login/i);
  });

  test('registration is rejected when the password confirmation does not match', async ({ page }) => {
    await page.goto('/Identity/Account/Register');
    await page.locator('#Input_Email').fill(`pw-user-${Date.now()}@example.com`);
    await page.locator('#Input_Password').fill('Pass@word1');
    await page.locator('#Input_ConfirmPassword').fill('Different@word2');
    await page.getByRole('button', { name: 'Register' }).click();

    // Stay on the register page with a validation error surfaced.
    await expect(page).toHaveURL(/Register/i);
    await expect(page.locator('.text-danger').first()).toContainText(/password/i);
  });
});
