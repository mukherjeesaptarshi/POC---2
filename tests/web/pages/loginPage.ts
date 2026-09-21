import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/index.htm');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: /log in/i }).click();
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.page.locator('.error')).toContainText(/could not be verified|required/i);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: /log out/i }).click();
  }
}