import { test, expect } from '@playwright/test';
import { AuthPage } from '~/libs/pages';

const EMAIL = 'den@dev.dev';
const PASSWORD = '12345';

test('has title', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.goToLogin();
  await expect(page).toHaveTitle(/TimeTrack/);
});

test('redirects unauthenticated user to login page', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.goToLogin();
  await page.goto('/');
  await authPage.goToLogin();

  await expect(page).toHaveURL('/login');
});

test('navigates to home page after sign in', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.login(EMAIL, PASSWORD);

  await expect(page).toHaveURL('/');
});

test('navigates to /login after logout', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.login(EMAIL, PASSWORD);
  await authPage.logout();

  await expect(page).toHaveURL('/login');
});

test('redirects to home if authenticated user tries to visit /login or /signup', async ({
  page,
}) => {
  const authPage = new AuthPage(page);
  await authPage.login(EMAIL, PASSWORD);
  const redirectResponse = page.waitForResponse((response) => {
    return (
      new URL(response.url()).pathname === '/login' &&
      response.request().method() === 'GET' &&
      response.status() === 302
    );
  });
  await authPage.goToLogin();
  await redirectResponse;
  await page.waitForURL('/', { timeout: 3000 });

  await expect(page).toHaveURL('/');
});
