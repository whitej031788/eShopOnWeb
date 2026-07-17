import { test, expect } from '@playwright/test';
import { login, DEMO_USER } from './helpers';

test.describe('Authentication', () => {
  test('a seeded user can log in', async ({ page }) => {
    await login(page, DEMO_USER);
    await expect(page.locator('.esh-identity-name').first()).toContainText(DEMO_USER.email);
  });

  test('invalid credentials are rejected', async ({ page }) => {
    await page.goto('/Identity/Account/Login');
    await page.locator('#Input_Email').fill('demouser@microsoft.com');
    await page.locator('#Input_Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Stay on the login page; no authenticated identity in the header.
    await expect(page).toHaveURL(/Login/i);
    await expect(page.locator('.esh-identity-name').first()).toHaveText(/Login/i);
  });
});
