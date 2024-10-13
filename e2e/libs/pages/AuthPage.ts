import type { Page } from '@playwright/test';

export default class AuthPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goToLogin() {
    return this.page.goto('/login');
  }
  public async goToSignUp() {
    return this.page.goto('/signup');
  }
  public async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page
      .getByRole('textbox', {
        name: /email/i,
      })
      .fill(email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page
      .getByRole('button', {
        name: /login/i,
      })
      .click();
    await this.page.waitForURL('/', { timeout: 3000 });
  }
  public async logout() {
    const menuTrigger = this.page.getByLabel('Show site menu');
    await menuTrigger.click();
    await this.page.getByRole('menuitem', { name: /logout/i }).click();
    await this.page.waitForURL('/login', { timeout: 3000 });
  }
}
