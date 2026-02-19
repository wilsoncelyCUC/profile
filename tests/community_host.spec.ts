import { test, expect } from '@playwright/test';

const SUPABASE_REST_PATTERN = '**/rest/v1/community_hosts**';

test.describe('Community Host Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Supabase insert so no real DB calls happen
    await page.route(SUPABASE_REST_PATTERN, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'mock-uuid-1234',
          full_name: 'Jane Smith',
          email: 'jane@company.com',
          phone_number: null,
          created_at: new Date().toISOString(),
        }]),
      });
    });

    await page.goto('/profile/');
  });

  test('modal opens when open-community-host-modal event is dispatched', async ({ page }) => {
    const modal = page.getByTestId('community-host-modal');

    // Should not be visible before event
    await expect(modal).not.toBeVisible();

    // Fire the event
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    // Should now be visible
    await expect(modal).toBeVisible();
  });

  test('blocks submit when full_name is empty', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    const modal = page.getByTestId('community-host-modal');
    await expect(modal).toBeVisible();

    // Click Next without typing anything
    await modal.getByRole('button', { name: /Next/i }).click();

    await expect(modal.getByText('Please enter your name.')).toBeVisible();
  });

  test('blocks submit when email is invalid', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    const modal = page.getByTestId('community-host-modal');

    // Step 1: valid name
    await modal.getByPlaceholder('Your full name').fill('Jane Smith');
    await modal.getByRole('button', { name: /Next/i }).click();

    // Step 2: bad email
    await modal.getByPlaceholder('you@company.com').fill('not-an-email');
    await modal.getByRole('button', { name: /Next/i }).click();

    await expect(modal.getByText('Please enter a valid email address.')).toBeVisible();
  });

  test('succeeds with phone_number empty (optional field)', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    const modal = page.getByTestId('community-host-modal');

    // Step 1: name
    await modal.getByPlaceholder('Your full name').fill('Jane Smith');
    await modal.getByRole('button', { name: /Next/i }).click();

    // Step 2: email
    await modal.getByPlaceholder('you@company.com').fill('jane@company.com');
    await modal.getByRole('button', { name: /Next/i }).click();

    // Step 3: skip phone
    await modal.getByRole('button', { name: /Skip/i }).click();

    // Success state
    await expect(page.getByTestId('community-host-success')).toBeVisible();
  });

  test('E2E: open from Start a conversation, fill all steps and submit', async ({ page }) => {
    await page.getByRole('button', { name: /Start a conversation/i }).click();

    const modal = page.getByTestId('community-host-modal');
    await expect(modal).toBeVisible();

    // Step 1: name
    await expect(modal.getByRole('heading', { name: /What's your name\?/i })).toBeVisible();
    await modal.getByPlaceholder('Your full name').fill('E2E Test User');
    await modal.getByRole('button', { name: /Next/i }).click();

    // Step 2: email
    await expect(modal.getByRole('heading', { name: /What's your email\?/i })).toBeVisible();
    await modal.getByPlaceholder('you@company.com').fill('e2e@example.com');
    await modal.getByRole('button', { name: /Next/i }).click();

    // Step 3: phone and submit
    await expect(modal.getByRole('heading', { name: /Phone number/i })).toBeVisible();
    await modal.getByPlaceholder('+49 123 456 7890').fill('+49 123 456 7890');
    await modal.getByRole('button', { name: /Submit/i }).click();

    await expect(page.getByTestId('community-host-success')).toBeVisible();
    await expect(modal.getByText(/We'll be in touch/i)).toBeVisible();
    await expect(modal.getByText(/Thanks for your interest in the Munich MLOps community/i)).toBeVisible();
  });
});
