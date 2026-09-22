import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/parabank/index.htm');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: /log in/i }).click();
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.page.locator('.error')).toContainText(/could not be verified|required/i);
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
    const protectedUrlPatterns = [/overview\.htm/i, /account.*\.htm/i, /billpay\.htm/i, /transfer\.htm/i];
    const currentUrl = this.page.url();

    for (const pattern of protectedUrlPatterns) {
      if (pattern.test(currentUrl)) {
        throw new Error(`Protected page remained accessible after logout: ${currentUrl}`);
      }
    }

    await expect(this.page.locator('input[name="username"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
    await expect(this.page.getByRole('button', { name: /log in/i })).toBeVisible();
    await expect(this.page).toHaveURL(/index\.htm|login\.htm/i);
  }
}