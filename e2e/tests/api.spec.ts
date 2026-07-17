import { test, expect, request } from '@playwright/test';
import { API_BASE_URL } from '../playwright.config';
import { ADMIN_USER } from './helpers';

/**
 * API-side smoke tests against the PublicApi (http://localhost:5200).
 * These mirror the operations described in openapi.yaml and are the API half
 * of the Application Inventory picture.
 */
test.describe('PublicApi', () => {
  test('GET /api/catalog-items returns a paged list', async () => {
    const api = await request.newContext({ baseURL: API_BASE_URL });
    const res = await api.get('/api/catalog-items?pageSize=10&pageIndex=0');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.catalogItems)).toBeTruthy();
    expect(body).toHaveProperty('pageCount');
    await api.dispose();
  });

  test('GET /api/catalog-brands and /api/catalog-types return collections', async () => {
    const api = await request.newContext({ baseURL: API_BASE_URL });
    const brands = await (await api.get('/api/catalog-brands')).json();
    const types = await (await api.get('/api/catalog-types')).json();
    expect(Array.isArray(brands.catalogBrands)).toBeTruthy();
    expect(Array.isArray(types.catalogTypes)).toBeTruthy();
    await api.dispose();
  });

  test('POST /api/authenticate issues a JWT for the admin account', async () => {
    const api = await request.newContext({ baseURL: API_BASE_URL });
    const res = await api.post('/api/authenticate', {
      data: { username: ADMIN_USER.email, password: ADMIN_USER.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.result).toBe(true);
    expect(body.token).toBeTruthy();
    await api.dispose();
  });
});
