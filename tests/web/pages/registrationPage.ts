import { expect, type Page } from '@playwright/test';

export type RegistrationCredentials = {
  username: string;
  password: string;
};

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/parabank/index.htm');
  }

  async clickRegisterLink(): Promise<void> {
    await this.page.locator("//div[@id='loginPanel']/p[2]/a").click();
  }

  async enterRequiredDetails(): Promise<RegistrationCredentials> {
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
    return { username, password };
  }

  async clickRegisterButton(): Promise<void> {
    await this.page.getByRole('button', { name: /register/i }).click();
  }

  async expectRegistrationMessage(): Promise<void> {
    const successMessage = this.page.getByText('Your account was created successfully');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Your account was created successfully');
  }

  async expectRegistrationErrorMessage(): Promise<void> {
    const errorMessages = this.page.locator('.error');
    await expect(errorMessages.first()).toBeVisible();
    await expect(errorMessages.first()).toContainText(/required|invalid|must be/i);
  }

  async register(): Promise<RegistrationCredentials> {
    await this.clickRegisterLink();
    const credentials = await this.enterRequiredDetails();
    await this.clickRegisterButton();
    await this.expectRegistrationMessage();
    return credentials;
  }

  async logout(): Promise<void> {
    await this.page.locator("//a[@href='logout.htm']").click();
  }

}