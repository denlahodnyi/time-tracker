import test, { expect } from '@playwright/test';
import { AuthPage } from '~/libs/pages';

test('can update profile data', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.login('jack@dev.dev', '12345');
  const menuTrigger = page.getByLabel('Show site menu');
  await menuTrigger.click();
  await page.getByRole('menuitem', { name: /profile/i }).click();
  await page.waitForURL('/profile', { timeout: 3000 });
  await page.getByLabel('First name').fill('John');
  await page.getByLabel('Last name').fill('Dow');
  await page.getByLabel('Email').fill('dow@dev.dev');
  await page.getByLabel('Bio').fill('dow dow');
  await page.getByRole('button', { name: /update/i }).click();
  await page.getByRole('link', { name: /go home/i }).click();
  await page.waitForURL('/');
  await menuTrigger.click();
  await page.getByRole('menuitem', { name: /profile/i }).click();
  await page.waitForURL('/profile', { timeout: 3000 });
  await expect(page.getByLabel('First name')).toHaveValue('John');
  await expect(page.getByLabel('Last name')).toHaveValue('Dow');
  await expect(page.getByLabel('Email')).toHaveValue('dow@dev.dev');
  await expect(page.getByLabel('Bio')).toHaveValue('dow dow');
});
