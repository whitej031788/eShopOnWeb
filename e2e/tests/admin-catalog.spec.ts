import { test, expect } from '@playwright/test';
import { login, ADMIN_USER } from './helpers';

/**
 * Blazor Admin catalog management (http://localhost:5106/admin).
 *
 * Unlike the storefront specs, this one drives the UI that actually talks to the
 * PublicApi (http://localhost:5200): the Blazor WASM app fetches a JWT from /User,
 * then reads and writes the catalog via the REST endpoints. Running this under the
 * postman-playwright plugin therefore captures real PublicApi traffic
 * (GET/POST/PUT catalog-items, catalog-brands, catalog-types) that lines up with
 * the "PublicApi Endpoints" Postman collection.
 */
test.describe('Admin catalog management (Blazor + PublicApi)', () => {
  // Booting the WASM runtime, logging in, and round-tripping create + edit is slow.
  test.slow();

  test('an admin can create and then edit a catalog item through the admin UI', async ({ page }) => {
    // Sign in as the seeded administrator so /admin authorizes and /User yields an admin token.
    await login(page, ADMIN_USER);

    // Load the Blazor admin catalog. The list rendering means the PublicApi GETs have returned.
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /Manage Product Catalog/i })).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();

    const itemName = `Admin UI Item ${Date.now()}`;

    // --- Create (fires POST /api/catalog-items) ---
    await page.getByRole('button', { name: /Create New/i }).click();
    const createModal = page.locator('.modal.Show');
    await expect(createModal).toBeVisible();
    // Text inputs in order: Name, Description, Price (InputNumber). Brand/Type default to the first option.
    await createModal.locator('input.form-control').nth(0).fill(itemName);
    await createModal.locator('input.form-control').nth(1).fill('Created via the admin UI');
    await createModal.locator('input.form-control').nth(2).fill('33.33');
    await createModal.getByRole('button', { name: 'Create', exact: true }).click();

    // The list reloads and now contains the new item.
    const createdRow = page.locator('table tbody tr', { hasText: itemName });
    await expect(createdRow.first()).toBeVisible();

    // --- Edit (fires PUT /api/catalog-items) ---
    const updatedName = `${itemName} (edited)`;
    await createdRow.first().getByRole('button', { name: 'Edit' }).click();
    const editModal = page.locator('.modal.Show');
    await expect(editModal).toBeVisible();
    await editModal.locator('input.form-control').nth(0).fill(updatedName);
    await editModal.locator('input.form-control').nth(2).fill('44.44');
    await editModal.getByRole('button', { name: 'Save', exact: true }).click();

    // The edited name and price are reflected back in the reloaded list.
    await expect(page.locator('table tbody tr', { hasText: updatedName }).first()).toBeVisible();
    await expect(page.locator('table tbody tr', { hasText: updatedName }).first()).toContainText('44.44');
  });
});
