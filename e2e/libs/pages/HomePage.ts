import type { Page } from '@playwright/test';
import AuthPage from './AuthPage';

export default class HomePage {
  private readonly page: Page;
  private readonly authPage: AuthPage;

  constructor(page: Page) {
    this.page = page;
    this.authPage = new AuthPage(page);
  }

  public async goto() {
    return this.page.goto('/');
  }
  public async loginAndGoto(email: string, password: string) {
    await this.authPage.login(email, password);
    return this.goto();
  }
  public async populateTaskForm(name: string, description?: string) {
    const dialog = this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: /New task details/i }),
    });
    await dialog.getByLabel('Name').fill(name);
    await dialog.getByLabel('Description').fill(description || '');
    return dialog;
  }
  public async addNewTask(name: string, description?: string) {
    await this.page.getByRole('button', { name: /add new task/i }).click();
    const dialog = await this.populateTaskForm(name, description);
    await dialog.getByRole('button', { name: /create/i }).click();
  }
  public getTaskLocator(taskName: string) {
    return this.page.getByRole('article').filter({
      has: this.page.getByRole('heading', { name: taskName, exact: true }),
    });
  }
}
