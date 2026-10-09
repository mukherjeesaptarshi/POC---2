import { expect, type Page } from '@playwright/test';
import { navigateWithRetry } from '../../../utils/pageNavigation';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await navigateWithRetry(this.page, '/parabank/index.htm');
    await expect(this.page.locator('input[name="username"]')).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator('input[name="password"]')).toBeVisible({ timeout: 5000 });
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: /log in/i }).click();
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.page.locator('.error')).toContainText(
      /could not be verified|invalid username or password|please enter a username and password|username and password.*required/i,
    );
  }

  async expectRejectionMessage(): Promise<void> {
    await expect(this.page.locator('.error')).toContainText(
      /could not be verified|invalid username or password|please enter a username and password/i,
    );
  }

  async expectBlankCredentialsMessage(): Promise<void> {
    await expect(this.page.locator('.error')).toContainText(/required|username and password/i);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: /log out/i }).click();
  }

  async goBack(): Promise<void> {
    await this.page.goBack().catch(() => undefined);
  }

  async expectProtectedPageInaccessibleAfterLogout(): Promise<void> {
    await this.page.reload();
    await expect(this.page).toHaveURL(/index\.htm|login\.htm/i);
    await expect(this.page.locator('input[name="username"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
    await expect(this.page.getByRole('button', { name: /log in/i })).toBeVisible();
  }
}