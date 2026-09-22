import { expect, type Page } from '@playwright/test';

export class AccountsOverviewPage {
  constructor(private readonly page: Page) {}

  async clickOpenNewAccountLink(): Promise<void> {
    await this.page.getByRole('link', { name: /open new account/i }).click();
  }

  async selectAccountType(type: 'CHECKING' | 'SAVINGS'): Promise<void> {
    await this.page.locator('select').first().selectOption({ label: type });
  }

  async clickOpenNewAccountButton(): Promise<void> {
    await this.page.getByRole('button', { name: /open new account/i }).click();
  }

  async expectAccountOpenedMessage(): Promise<void> {
    const content = this.page.locator('body');
    await expect(content).toContainText(/Account Opened!/i);
    await expect(content).toContainText(/Congratulations, your account is now open/i);
    await expect(content).toContainText(/Your new account number:/i);
  }

  async expectLoadedWithDefaultAccount(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /accounts overview/i })).toBeVisible();
    const accountRows = this.page.locator('#accountTable tbody tr');
    await expect(accountRows.first()).toBeVisible();
    const balance = accountRows.first().locator('td').nth(1);
    await expect(balance).not.toHaveText('');
    await expect(balance).toContainText(/\$|-?\d/);
  }
}