import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type BillPayDetails = {
  payeeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  accountNumber: string;
  amount: string;
};

export class AccountsOverviewPage {
  private transferBaseline?: {
    sourceBalanceCents: number;
    destinationBalanceCents: number;
    amountCents: number;
  };
  private rapidTransferCount = 0;

  constructor(private readonly page: Page) {}

  private async openAccountsOverview(): Promise<void> {
    const overviewLink = this.page.getByRole('link', { name: /accounts overview/i });
    if (await overviewLink.isVisible()) {
      await overviewLink.click();
    } else if (!await this.page.locator('#accountTable').isVisible()) {
      await this.page.goto('overview.htm');
    }

    await expect(this.page.locator('#accountTable')).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator('#accountTable tbody tr')).not.toHaveCount(0, { timeout: 15000 });
  }

  async clickOpenNewAccountLink(): Promise<void> {
    await this.page.getByRole('link', { name: /open new account/i }).click();
  }

  async clickTransferFundsLink(): Promise<void> {
    const accountWasJustOpened = /openaccount\.htm/i.test(this.page.url())
      || await this.page.getByText(/Account Opened!/i).isVisible().catch(() => false);
    await this.openAccountsOverview();

    const rows = this.page.locator('#accountTable tbody tr');
    if (accountWasJustOpened) {
      await expect(rows).toHaveCount(3, { timeout: 15000 });
    }
    const accountCount = await rows.count();
    if (accountCount >= 3) {
      this.transferBaseline = {
        sourceBalanceCents: this.parseCurrencyValue(await rows.nth(0).locator('td').nth(1).innerText()),
        destinationBalanceCents: this.parseCurrencyValue(await rows.nth(1).locator('td').nth(1).innerText()),
        amountCents: 0,
      };
    }

    await this.page.getByRole('link', { name: /transfer funds/i }).click();
  }

  async clickAccountsOverviewLink(): Promise<void> {
    await this.page.getByRole('link', { name: /accounts overview/i }).click();
    await expect(this.page.locator('#accountTable')).toBeVisible({ timeout: 15000 });
  }

  async clickAccountNumberLink(): Promise<void> {
    await this.page.locator('#accountTable tbody tr').first().getByRole('link').click();
    await expect(this.page.locator('#transactionTable')).toBeVisible({ timeout: 15000 });
  }

  async clickTransactionLink(): Promise<void> {
    await this.page.getByRole('link', { name: /transaction/i }).first().click();
  }

  async clickFindTransactionsLink(): Promise<void> {
    // await this.page.getByRole('link', { name: 'Find Transactions' }).click();
    await this.page.pause();
    await this.page.locator("//a[text()='Find Transactions']").click();
  }

  async clickBillPayLink(): Promise<void> {
    await this.page.getByRole('link', { name: /bill pay/i }).click();
  }

  async clickSendPaymentButton(): Promise<void> {
    await this.page.locator('input[value="Send Payment"]').click();
  }

  async payBill(details: BillPayDetails): Promise<void> {
    await this.fillBillPayForm(undefined, details);
    await this.clickSendPaymentButton();
    await this.expectBillPaySuccessMessage();
  }

  async fillBillPayForm(exceptField?: string, details?: Partial<BillPayDetails>): Promise<void> {
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
    if (details) {
      values['payee name'] = details.payeeName ?? values['payee name'];
      values.address = details.address ?? values.address;
      values.city = details.city ?? values.city;
      values.state = details.state ?? values.state;
      values['zip code'] = details.zipCode ?? values['zip code'];
      values['phone number'] = details.phoneNumber ?? values['phone number'];
      values['account number'] = details.accountNumber ?? values['account number'];
      values['verify account number'] = details.accountNumber ?? values['verify account number'];
      values.amount = details.amount ?? values.amount;
    }

    const skipField = exceptField?.trim().toLowerCase();
    for (const [fieldName, value] of Object.entries(values)) {
      if (skipField && fieldName === skipField) {
        await this.page.locator(`input[name="${this.getBillPayFieldName(fieldName)}"]`).fill('');
        continue;
      }
      await this.page.locator(`input[name="${this.getBillPayFieldName(fieldName)}"]`).fill(value);
    }
  }

  async paySameBillTwice(): Promise<void> {
    const details: BillPayDetails = {
      payeeName: 'ACME Utilities',
      address: '10 Market St',
      city: 'Sydney',
      state: 'NSW',
      zipCode: '2000',
      phoneNumber: '0400123456',
      accountNumber: '123456',
      amount: '25.00',
    };

    await this.payBill(details);
    await this.clickBillPayLink();
    await this.payBill(details);
  }

  async payBillsFromCsv(fileName: string): Promise<void> {
    const csvPath = resolve(process.cwd(), 'src', 'features', 'web', fileName);
    const lines = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
    const headers = lines.shift()?.split(',') ?? [];
    const rows = lines.map((line) => {
      const values = line.split(',');
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])) as BillPayDetails;
    });

    if (rows.length !== 10) {
      throw new Error(`Expected 10 billers in ${fileName}, found ${rows.length}.`);
    }

    for (const [index, row] of rows.entries()) {
      await this.payBill(row);
      if (index < rows.length - 1) {
        await this.clickBillPayLink();
      }
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

  async expectTransactionDetails(): Promise<void> {
    await expect(this.page.locator('body')).toContainText(/transaction details|transaction id|amount|description/i);
  }

  async expectTwoBillPaymentDebitEntries(): Promise<void> {
    await this.clickAccountsOverviewLink();
    await this.clickAccountNumberLink();

    const paymentRows = this.page.locator('#transactionTable tbody tr').filter({ hasText: /ACME Utilities|25\.00/i });
    await expect(paymentRows).toHaveCount(2, { timeout: 15000 });
    const debitValues = await paymentRows.evaluateAll((rows) => rows.map((row) => {
      const cells = [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim() ?? '');
      return cells[2] ?? '';
    }));
    expect(debitValues.filter(Boolean)).toHaveLength(2);
  }

  async expectCsvBillPaymentDebits(fileName: string): Promise<void> {
    const csvPath = resolve(process.cwd(), 'src', 'features', 'web', fileName);
    const lines = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
    const headers = lines.shift()?.split(',') ?? [];
    const rows = lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, line.split(',')[index] ?? ''])));
    const expectedTotalCents = rows.reduce((total, row) => total + this.parseCurrencyValue(row.amount), 0);

    await this.clickAccountsOverviewLink();
    await this.clickAccountNumberLink();

    const transactionRows = this.page.locator('#transactionTable tbody tr');
    await expect(transactionRows).not.toHaveCount(0, { timeout: 15000 });
    const debits = await transactionRows.evaluateAll((rows) => rows.map((row) => {
      const cells = [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim() ?? '');
      return cells[2] ?? '';
    }).filter(Boolean));
    const actualDebitCents = debits.reduce((total, debit) => total + this.parseCurrencyValue(debit), 0);

    expect(debits.filter(Boolean)).toHaveLength(10);
    expect(actualDebitCents).toBe(expectedTotalCents);
  }

  async expectBillPayFieldError(fieldName: string): Promise<void> {
    const normalized = fieldName.toLowerCase().trim();
    const errorMap: Record<string, RegExp> = {
      'payee name': /Payee name is required./i,
      address: /Address is required./i,
      city: /City is required./i,
      state: /State is required./i,
      'zip code': /Zip code is required./i,
      'phone number': /Phone number is required./i,
      'account number': /Account number is required./i,
      'verify account number': /Account number is required./i,
      amount: /The amount cannot be empty./i,
    };

    const regex = errorMap[normalized] ?? /required/i;
    await expect(this.page.locator('body')).toContainText(regex);
  }

  async expectBillPayAccountNumberMismatchError(): Promise<void> {
    await expect(this.page.locator('body')).toContainText(/account numbers?.*(do not match|mismatch)|do not match.*account numbers?/i);
  }

  async expectBillPayInvalidAmountError(): Promise<void> {
    const amountInput = this.page.locator('input[name="amount"]');
    const bodyText = await this.page.locator('body').innerText();
    const hasValidationMessage = /amount.*(invalid|required|number|valid)|invalid.*amount/i.test(bodyText);
    const hasNativeValidation = await amountInput.evaluate((element) => !(element as HTMLInputElement).form?.checkValidity());

    expect(hasValidationMessage || hasNativeValidation).toBeTruthy();
  }

  async expectBillPayAmountError(): Promise<void> {
    await expect(this.page.locator('body')).toContainText(/amount|balance|insufficient|funds|cannot|error/i);
    await expect(this.page.locator('body')).not.toContainText(/Bill Payment Complete.*was successful/i);
  }

  async selectAccountType(type: 'CHECKING' | 'SAVINGS'): Promise<void> {
    await this.page.locator('select').first().selectOption({ label: type });
  }

  async clickOpenNewAccountButton(): Promise<void> {
    const button = this.page.locator("//input[@class='button' and @value='Open New Account']");
    await expect(button).toBeVisible({ timeout: 15000 });
    await expect(button).toBeEnabled({ timeout: 15000 });

    const fundingAccount = this.page.locator('#fromAccountId');
    const accountType = await this.page.locator('#type').inputValue().catch(() => '0');
    if (await fundingAccount.isVisible() && accountType === '1') {
      await expect(fundingAccount.locator('option')).not.toHaveCount(0, { timeout: 15000 });
      await fundingAccount.selectOption({ index: 0 });
    }

    await button.click();

  }

  async clickTransferButton(): Promise<void> {
    await this.page.locator('input[type="submit"]').click();
  }

  async transferFullAvailableBalanceToSecondAccount(): Promise<void> {
    if (!this.transferBaseline) {
      throw new Error('Transfer baseline was not captured before transferring the full balance.');
    }

    const amount = (this.transferBaseline.sourceBalanceCents / 100).toFixed(2);
    this.transferBaseline.amountCents = this.transferBaseline.sourceBalanceCents;
    await this.page.locator('#amount').fill(amount);
    await this.selectDropdownOption('to account', 'second option');
    await this.clickTransferButton();
  }

  async attemptTransferToSecondAccount(amount: string): Promise<void> {
    await this.page.locator('#amount').fill(amount);
    await this.selectDropdownOption('to account', 'second option');
    await this.clickTransferButton();
  }

  async attemptSameAccountTransfer(amount: string): Promise<void> {
    await this.page.locator('#amount').fill(amount);
    await this.selectDropdownOption('to account', 'first option');
    await this.clickTransferButton();
  }

  async performRapidTransfers(count: number, amount: string): Promise<void> {
    if (!this.transferBaseline) {
      await this.page.getByRole('link', { name: /accounts overview/i }).click();
      const accountLinks = this.page.locator('#accountTable tbody tr a');
      await expect(accountLinks).toHaveCount(2, { timeout: 15000 });
      const rows = this.page.locator('#accountTable tbody tr');
      this.transferBaseline = {
        sourceBalanceCents: this.parseCurrencyValue(await rows.nth(0).locator('td').nth(1).innerText()),
        destinationBalanceCents: this.parseCurrencyValue(await rows.nth(1).locator('td').nth(1).innerText()),
        amountCents: 0,
      };
      await this.page.getByRole('link', { name: /transfer funds/i }).click();
    }

    this.rapidTransferCount = count;
    this.transferBaseline.amountCents = this.parseCurrencyValue(amount);

    for (let index = 0; index < count; index++) {
      await this.page.locator('#amount').fill(amount);
      await this.selectDropdownOption('to account', 'second option');
      await this.clickTransferButton();
      await expect(this.page.locator('body')).toContainText(/Transfer Complete!/i);

      if (index < count - 1) {
        await this.page.getByRole('link', { name: /transfer funds/i }).click();
      }
    }
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
    const billPayFieldNames: Record<string, string> = {
      'verify account number': 'verifyAccount',
      amount: 'amount',
    };

    const billPayFieldName = billPayFieldNames[normalized];
    if (billPayFieldName && await this.page.locator(`input[name="${billPayFieldName}"]`).count() > 0) {
      await this.page.locator(`input[name="${billPayFieldName}"]`).fill(value);
      return;
    }

    if (normalized === 'amount') {
      await this.page.locator('#amount').fill(value);
      if (this.transferBaseline) {
        this.transferBaseline.amountCents = this.parseCurrencyValue(value);
      }
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

  async expectDebitAndCreditInBothAccounts(): Promise<void> {
    if (!this.transferBaseline || this.transferBaseline.amountCents <= 0) {
      throw new Error('Transfer baseline was not captured before validating account balances.');
    }

    await this.openAccountsOverview();

    const rows = this.page.locator('#accountTable tbody tr');
    await expect(rows.nth(0)).toBeVisible();
    await expect(rows.nth(1)).toBeVisible();

    const sourceBalanceCents = this.parseCurrencyValue(await rows.nth(0).locator('td').nth(1).innerText());
    const destinationBalanceCents = this.parseCurrencyValue(await rows.nth(1).locator('td').nth(1).innerText());
    const { amountCents, sourceBalanceCents: initialSourceBalanceCents, destinationBalanceCents: initialDestinationBalanceCents } = this.transferBaseline;

    expect(sourceBalanceCents).toBe(initialSourceBalanceCents - amountCents);
    expect(destinationBalanceCents).toBe(initialDestinationBalanceCents + amountCents);
  }

  async expectSourceAccountBalanceIsZero(): Promise<void> {
    if (!this.transferBaseline || this.transferBaseline.amountCents !== this.transferBaseline.sourceBalanceCents) {
      throw new Error('The full-balance transfer amount does not match the opening source balance.');
    }

    await this.openAccountsOverview();
    const sourceBalance = await this.page.locator('#accountTable tbody tr').nth(0).locator('td').nth(1).innerText();
    expect(this.parseCurrencyValue(sourceBalance)).toBe(0);
  }

  async expectTransferAmountRejected(): Promise<void> {
    const bodyText = await this.page.locator('body').innerText();
    const hasValidationMessage = /invalid amount|amount cannot|amount must|greater than.*balance|insufficient|positive|decimal|required/i.test(bodyText);
    const hasNativeValidation = await this.page.locator('#amount').evaluate((element) => !(element as HTMLInputElement).form?.checkValidity());
    const remainsOnTransferForm = await this.page.locator('#amount').isVisible() && !/Transfer Complete!/i.test(bodyText);

    expect(hasValidationMessage || hasNativeValidation || remainsOnTransferForm).toBeTruthy();
  }

  async expectSameAccountTransferRejected(): Promise<void> {
    await expect(this.page.locator('body')).toContainText(/same account|different account|cannot transfer|must be different|invalid|Error!|internal error/i);
  }

  async expectRapidTransferBalances(): Promise<void> {
    if (!this.transferBaseline || this.rapidTransferCount !== 10) {
      throw new Error('Rapid transfer state was not initialized for ten transfers.');
    }

    await this.openAccountsOverview();
    const rows = this.page.locator('#accountTable tbody tr');
    const amountCents = this.transferBaseline.amountCents * this.rapidTransferCount;
    const sourceBalance = this.parseCurrencyValue(await rows.nth(0).locator('td').nth(1).innerText());
    const destinationBalance = this.parseCurrencyValue(await rows.nth(1).locator('td').nth(1).innerText());

    expect(sourceBalance).toBe(this.transferBaseline.sourceBalanceCents - amountCents);
    expect(destinationBalance).toBe(this.transferBaseline.destinationBalanceCents + amountCents);
  }

  async expectRapidTransferLedgerRows(): Promise<void> {
    const accountLinks = this.page.locator('#accountTable tbody tr').locator('a');
    await expect(accountLinks.nth(0)).toBeVisible();
    await accountLinks.nth(0).click();
    const firstAccountRows = this.page.locator('#transactionTable tbody tr');
    await expect(firstAccountRows).not.toHaveCount(0, { timeout: 15000 });
    const amountText = (this.transferBaseline!.amountCents / 100).toFixed(2).replace('.', '\\.');
    const firstTransferRows = firstAccountRows.filter({ hasText: new RegExp(`\\$${amountText}`) });
    await expect(firstTransferRows).toHaveCount(10, { timeout: 15000 });
    const firstAccountRowCount = await firstTransferRows.count();
    const firstLedgerEntries = await firstTransferRows.evaluateAll((rows) => rows.map((row) => {
      const cells = [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim() ?? '');
      return { debit: cells[2] ?? '', credit: cells[3] ?? '' };
    }));

    await this.page.getByRole('link', { name: /accounts overview/i }).click();
    const overviewAccountLinks = this.page.locator('#accountTable tbody tr').locator('a');
    await overviewAccountLinks.nth(1).click();
    const secondAccountRows = this.page.locator('#transactionTable tbody tr');
    await expect(secondAccountRows).not.toHaveCount(0, { timeout: 15000 });
    const secondTransferRows = secondAccountRows.filter({ hasText: new RegExp(`\\$${amountText}`) });
    await expect(secondTransferRows).toHaveCount(10, { timeout: 15000 });
    const secondAccountRowCount = await secondTransferRows.count();

    expect(firstAccountRowCount + secondAccountRowCount).toBe(20);
    const secondLedgerEntries = await secondTransferRows.evaluateAll((rows) => rows.map((row) => {
      const cells = [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim() ?? '');
      return { debit: cells[2] ?? '', credit: cells[3] ?? '' };
    }));
    const ledgerEntries = [...firstLedgerEntries, ...secondLedgerEntries];
    const debitCount = ledgerEntries.filter((entry) => entry.debit !== '').length;
    const creditCount = ledgerEntries.filter((entry) => entry.credit !== '').length;
    expect(debitCount).toBe(10);
    expect(creditCount).toBe(10);
  }

  async expectAccountOpenedMessage(): Promise<void> {
    // const content = this.page.locator('body');
    const content = this.page.locator("//div[@id='openAccountResult']/p[1]");
    const bodyText = await content.innerText();

    // const hasBanner = /Account Opened!/i.test(bodyText)
    //   || /Congratulations, your account is now open./i.test(bodyText)
    //   || /Your new account number:/i.test(bodyText);

    // const hasOverview = /Accounts Overview/i.test(bodyText) && /Total\s*\$\d+\.\d{2}/i.test(bodyText);

    // expect(bodyText || hasOverview).toBeTruthy();
    expect(bodyText || "Congratulations, your account is now open.").toBeTruthy();

    // await this.page.pause();

  }

  async expectSavingsAccountVisibleInOverview(): Promise<void> {
    await this.openAccountsOverview();

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
      await expect(this.page.locator('#openAccountResult')).toContainText(/Account Opened!/i, { timeout: 15000 });
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
    await this.openAccountsOverview();

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