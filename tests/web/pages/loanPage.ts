import { expect, type Page } from '@playwright/test';

export class LoanPage {
  private approvedAccountNumber?: string;

  constructor(private readonly page: Page) {}

  async apply(amount: string, downPayment: string): Promise<void> {
    await this.page.getByRole('link', { name: /request loan/i }).click();
    await this.page.locator('#amount').fill(amount);
    await this.page.locator('#downPayment').fill(downPayment);
    await this.page.locator('#fromAccountId').selectOption({ index: 0 });
    await this.page.locator('input[type="button"]').click();
  }

  async expectStatus(expectedStatus: 'Approved' | 'Denied'): Promise<void> {
    const body = this.page.locator('body');
    await expect(body).toContainText(/Loan Request Processed/i, { timeout: 15000 });
    await expect(body).toContainText(new RegExp(`Status:\\s*${expectedStatus}`, 'i'));

    if (expectedStatus === 'Approved') {
      const bodyText = await body.innerText();
      this.approvedAccountNumber = bodyText.match(/Your new account number:\s*(\d+)/i)?.[1];
      expect(this.approvedAccountNumber).toBeTruthy();
    }
  }

  async expectDeniedMessage(): Promise<void> {
    await this.expectStatus('Denied');
    await expect(this.page.locator('body')).toContainText(/cannot grant|denied|not approved|insufficient/i);
  }

  async expectBoundaryRejected(): Promise<void> {
    const bodyText = await this.page.locator('body').innerText();
    const approved = /Status:\s*Approved/i.test(bodyText);
    const denied = /Status:\s*Denied/i.test(bodyText);
    const validation = /required|invalid|must be|cannot|amount/i.test(bodyText);
    expect(approved).toBeFalsy();
    expect(denied || validation).toBeTruthy();
  }

  async expectApprovedAccountInOverview(): Promise<void> {
    if (!this.approvedAccountNumber) throw new Error('No approved loan account was captured.');

    await this.page.getByRole('link', { name: /accounts overview/i }).click();
    const accountLinks = this.page.locator('#accountTable tbody tr a');
    await expect(accountLinks.filter({ hasText: this.approvedAccountNumber })).toHaveCount(1, { timeout: 15000 });
  }

  async transferFromApprovedLoanAccount(): Promise<void> {
    if (!this.approvedAccountNumber) throw new Error('No approved loan account was captured.');

    await this.page.getByRole('link', { name: /transfer funds/i }).click();
    const from = this.page.locator('#fromAccountId');
    const to = this.page.locator('#toAccountId');
    const loanOption = from.locator('option').filter({ hasText: this.approvedAccountNumber });
    await expect(loanOption).toHaveCount(1);
    await from.selectOption({ label: this.approvedAccountNumber });
    await to.selectOption({ index: 0 });
    await this.page.locator('#amount').fill('1.00');
    await this.page.locator('input[type="submit"]').click();
    await expect(this.page.locator('body')).toContainText(/Transfer Complete!/i);
  }
}