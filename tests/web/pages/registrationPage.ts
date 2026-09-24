import { expect, type Page } from '@playwright/test';

export type RegistrationCredentials = {
  username: string;
  password: string;
};

export type RegistrationFormData = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
  confirmPassword: string;
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

  async fillRegistrationForm(data: Partial<RegistrationFormData>): Promise<void> {
    await this.page.locator('input[name="customer.firstName"]').fill(data.firstName ?? 'Web');
    await this.page.locator('input[name="customer.lastName"]').fill(data.lastName ?? 'Smoke');
    await this.page.locator('input[name="customer.address.street"]').fill(data.address ?? '1 Test Street');
    await this.page.locator('input[name="customer.address.city"]').fill(data.city ?? 'Sydney');
    await this.page.locator('input[name="customer.address.state"]').fill(data.state ?? 'NSW');
    await this.page.locator('input[name="customer.address.zipCode"]').fill(data.zipCode ?? '2000');
    await this.page.locator('input[name="customer.phoneNumber"]').fill(data.phoneNumber ?? '0400000000');
    await this.page.locator('input[name="customer.ssn"]').fill(data.ssn ?? '123456789');
    await this.page.locator('input[name="customer.username"]').fill(data.username ?? `webuser${Date.now()}`);
    await this.page.locator('input[name="customer.password"]').fill(data.password ?? 'Password123!');
    await this.page.locator('input[name="repeatedPassword"]').fill(data.confirmPassword ?? 'Password123!');
  }

  async expectRegistrationMessage(): Promise<void> {
    const successMessage = this.page.getByText('Your account was created successfully');
    await expect(successMessage).toBeVisible({ timeout: 15000 });
    await expect(successMessage).toContainText('Your account was created successfully');
  }

  async expectRegistrationErrorMessage(): Promise<void> {
    const errorMessages = this.page.locator('.error');
    await expect(errorMessages.first()).toBeVisible();
    await expect(errorMessages.first()).toContainText(/required|invalid|must be/i);
  }

  async expectBlankFieldError(fieldName: string): Promise<void> {
    const normalized = fieldName.toLowerCase().trim();
    const errorText = this.page.locator('.error');
    await expect(errorText.first()).toBeVisible();
    await expect(errorText.first()).toContainText(/required|field is required|must be entered/i);

    if (normalized === 'first name' || normalized === 'last name' || normalized === 'address' || normalized === 'city' || normalized === 'state' || normalized === 'zip code' || normalized === 'phone number' || normalized === 'ssn' || normalized === 'username' || normalized === 'password') {
      await expect(errorText.first()).toContainText(/required|must be entered/i);
    }
  }

  async register(): Promise<RegistrationCredentials> {
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await this.page.goto('/parabank/index.htm');
      }

      try {
        await this.clickRegisterLink();
        const credentials = await this.enterRequiredDetails();
        await this.clickRegisterButton();
        await this.expectRegistrationMessage();
        return credentials;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  async logout(): Promise<void> {
    await this.page.locator("//a[@href='logout.htm']").click();
  }

}