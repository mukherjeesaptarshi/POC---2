import { expect, type Page } from '@playwright/test';

export type RegistrationCredentials = {
  username: string;
  password: string;
};

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/index.htm');
    await this.page.getByRole('link', { name: /register/i }).click();
  }

  async register(): Promise<RegistrationCredentials> {
    const username = `webuser${Date.now()}`;
    const password = 'Password123!';
    await this.page.locator('input[name="customer.firstName"]').fill('Web');
    await this.page.locator('input[name="customer.lastName"]').fill('Smoke');
    await this.page.locator('input[name="customer.address.street"]').fill('1 Test Street');
    await this.page.locator('input[name="customer.address.city"]').fill('Sydney');
    await this.page.locator('input[name="customer.address.state"]').fill('NSW');
    await this.page.locator('input[name="customer.address.zipCode"]').fill('2000');
    await this.page.locator('input[name="customer.phoneNumber"]').fill('0400000000');
    await this.page.locator('input[name="customer.ssn"]').fill('123456789');
    await this.page.locator('input[name="customer.username"]').fill(username);
    await this.page.locator('input[name="customer.password"]').fill(password);
    await this.page.locator('input[name="repeatedPassword"]').fill(password);
    await this.page.getByRole('button', { name: /register/i }).click();
    await expect(this.page.getByRole('heading', { name: /accounts overview/i })).toBeVisible();
    return { username, password };
  }
}