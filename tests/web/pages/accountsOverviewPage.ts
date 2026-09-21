import { expect, type Page } from '@playwright/test';

export class AccountsOverviewPage {
  constructor(private readonly page: Page) {}

  async expectLoadedWithDefaultAccount(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /accounts overview/i })).toBeVisible();
    const accountRows = this.page.locator('#accountTable tbody tr');
    await expect(accountRows.first()).toBeVisible();
    const balance = accountRows.first().locator('td').nth(1);
    await expect(balance).not.toHaveText('');
    await expect(balance).toContainText(/\$|-?\d/);
  }
}