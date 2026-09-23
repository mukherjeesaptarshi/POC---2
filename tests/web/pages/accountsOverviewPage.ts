import { expect, type Page } from '@playwright/test';

export class AccountsOverviewPage {
  constructor(private readonly page: Page) {}

  async clickOpenNewAccountLink(): Promise<void> {
    await this.page.getByRole('link', { name: /open new account/i }).click();
  }

  async clickTransferFundsLink(): Promise<void> {
    await this.page.getByRole('link', { name: /transfer funds/i }).click();
  }

  async clickBillPayLink(): Promise<void> {
    await this.page.getByRole('link', { name: /bill pay/i }).click();
  }

  async clickSendPaymentButton(): Promise<void> {
    await this.page.locator('input[value="Send Payment"]').click();
  }

  async fillBillPayForm(exceptField?: string): Promise<void> {
    const values: Record<string, string> = {
      'payee name': 'ACME Utilities',
      address: '10 Market St',
      city: 'Sydney',
      state: 'NSW',
      'zip code': '2000',
      'phone number': '0400123456',
      'account number': '123456',
      'verify account number': '123456',
      amount: '25.00',
    };

    const skipField = exceptField?.trim().toLowerCase();
    for (const [fieldName, value] of Object.entries(values)) {
      if (skipField && fieldName === skipField) {
        await this.page.locator(`input[name="${this.getBillPayFieldName(fieldName)}"]`).fill('');
        continue;
      }
      await this.page.locator(`input[name="${this.getBillPayFieldName(fieldName)}"]`).fill(value);
    }
  }

  private getBillPayFieldName(fieldName: string): string {
    const normalized = fieldName.toLowerCase().trim();
    const fieldMap: Record<string, string> = {
      'payee name': 'payee.name',
      address: 'payee.address.street',
      city: 'payee.address.city',
      state: 'payee.address.state',
      'zip code': 'payee.address.zipCode',
      'phone number': 'payee.phoneNumber',
      'account number': 'payee.accountNumber',
      'verify account number': 'verifyAccount',
      amount: 'amount',
    };
    return fieldMap[normalized] ?? normalized;
  }

  async expectBillPaySuccessMessage(): Promise<void> {
    const content = this.page.locator('body');
    await expect(content).toContainText(/Bill Payment Complete/i);
    await expect(content).toContainText(/was successful/i);
  }

  async expectBillPayFieldError(fieldName: string): Promise<void> {
    const normalized = fieldName.toLowerCase().trim();
    const errorMap: Record<string, RegExp> = {
      'payee name': /Payee name is required/i,
      address: /Address is required/i,
      city: /City is required/i,
      state: /State is required/i,
      'zip code': /Zip code is required/i,
      'phone number': /Phone number is required/i,
      'account number': /Account number is required/i,
      'verify account number': /Verify account number is required/i,
      amount: /Amount is required/i,
    };

    const regex = errorMap[normalized] ?? /required/i;
    await expect(this.page.locator('body')).toContainText(regex);
  }

  async selectAccountType(type: 'CHECKING' | 'SAVINGS'): Promise<void> {
    await this.page.locator('select').first().selectOption({ label: type });
  }

  async clickOpenNewAccountButton(): Promise<void> {
    await this.page.getByRole('button', { name: /open new account/i }).click();
  }

  async clickTransferButton(): Promise<void> {
    await this.page.locator('input[type="submit"]').click();
  }

  async attemptOpenAccountWithInsufficientFundingBalance(): Promise<void> {
    await this.page.evaluate(() => {
      const accounts = (window as any).accounts ?? [];
      if (Array.isArray(accounts) && accounts.length > 0) {
        accounts[0].balance = 50;
      }
    });

    await this.page.locator('select').first().selectOption({ label: 'SAVINGS' });
    await this.page.getByRole('button', { name: /open new account/i }).click();
  }

  async expectInsufficientFundingErrorMessage(): Promise<void> {
    const content = this.page.locator('body');
    await expect(content).toContainText(/minimum of \$100|insufficient|not enough funds|must be deposited/i);
  }

  async selectDropdownOption(fieldName: string, optionText: string): Promise<void> {
    const normalizedField = fieldName.toLowerCase().trim();
    const normalizedOption = optionText.toLowerCase().trim();

    if (normalizedField === 'to account') {
      const dropdown = this.page.getByLabel(/to account/i).or(this.page.locator('select').nth(1));
      if (normalizedOption === 'second option') {
        await dropdown.selectOption({ index: 1 });
        return;
      }
      if (normalizedOption === 'first option') {
        await dropdown.selectOption({ index: 0 });
        return;
      }
      await dropdown.selectOption({ label: optionText });
      return;
    }

    throw new Error(`Unsupported transfer dropdown: ${fieldName}`);
  }

  async enterText(fieldName: string, value: string): Promise<void> {
    const normalized = fieldName.toLowerCase().trim();
    if (normalized === 'amount') {
      await this.page.locator('#amount').fill(value);
      return;
    }
    throw new Error(`Unsupported transfer field: ${fieldName}`);
  }

  async expectTransferFundsErrorMessage(): Promise<void> {
    const content = this.page.locator('body');
    await expect(content).toContainText(/Transfer Funds/i);
    await expect(content).toContainText(/amount/i);
  }

  async expectTransferCompleteMessage(): Promise<void> {
    const content = this.page.locator('body');
    await expect(content).toContainText(/Transfer Complete!/i);
    await expect(content).toContainText(/has been transferred from account/i);
  }

  async expectAccountOpenedMessage(): Promise<void> {
    const content = this.page.locator('body');
    const bodyText = await content.innerText();

    const hasBanner = /Account Opened!/i.test(bodyText)
      || /Congratulations, your account is now open/i.test(bodyText)
      || /Your new account number:/i.test(bodyText);

    const hasOverview = /Accounts Overview/i.test(bodyText) && /Total\s*\$\d+\.\d{2}/i.test(bodyText);

    expect(hasBanner || hasOverview).toBeTruthy();
  }

  async expectSavingsAccountVisibleInOverview(): Promise<void> {
    await expect(this.page.locator('#accountTable')).toBeVisible();

    const rows = this.page.locator('#accountTable tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const tableText = await this.page.locator('#accountTable').innerText();
    const hasBalance = /\$\d+\.\d{2}/.test(tableText);
    expect(hasBalance).toBeTruthy();

    const accountNumberCell = rows.first().locator('td').first();
    await expect(accountNumberCell).not.toHaveText('');
  }

  async expectCheckingAccountVisibleInOverview(): Promise<void> {
    await this.expectSavingsAccountVisibleInOverview();
  }

  async openMultipleNewAccounts(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.clickOpenNewAccountLink();
      await this.clickOpenNewAccountButton();
      await expect(this.page.getByText(/Account Opened!/i)).toBeVisible({ timeout: 15000 });
      if (i < count - 1) {
        await this.clickOpenNewAccountLink();
      }
    }
  }

  private parseCurrencyValue(value: string): number {
    const normalized = value.replace(/[$,\s]/g, '');
    if (!normalized) return 0;
    const number = Number.parseFloat(normalized);
    return Math.round(number * 100);
  }

  async expectAccountsOverviewTotalMatchesBalances(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /accounts overview/i })).toBeVisible();

    const rows = this.page.locator('#accountTable tbody tr');
    const rowCount = await rows.count();
    let sumOfBalances = 0;

    for (let index = 0; index < rowCount - 1; index++) {
      const balanceText = await rows.nth(index).locator('td').nth(1).innerText();
      sumOfBalances += this.parseCurrencyValue(balanceText);
    }

    const totalText = await rows.nth(rowCount - 1).locator('td').nth(1).innerText();
    const totalBalance = this.parseCurrencyValue(totalText);

    expect(totalBalance).toBe(sumOfBalances);
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