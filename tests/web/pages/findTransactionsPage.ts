import { expect, type Page } from '@playwright/test';
import { AccountsOverviewPage } from './accountsOverviewPage';

type TransactionSample = {
  id: string;
  date: string;
  amount: string;
  accountId: string;
};

export class FindTransactionsPage {
  private latestTransaction?: TransactionSample;

  constructor(
    private readonly page: Page,
    private readonly accountsPage: AccountsOverviewPage,
  ) {}

  async seedBillPayments(count = 1): Promise<void> {
    for (let index = 0; index < count; index++) {
      // await this.page.pause();
      await this.accountsPage.clickBillPayLink();
      await this.accountsPage.fillBillPayForm();
      await this.page.locator('input[name="amount"]').fill('1.00');
      await this.accountsPage.clickSendPaymentButton();
      await this.accountsPage.expectBillPaySuccessMessage();
    }
  }

  async searchLatestTransactionBy(field: 'id' | 'date' | 'amount' | 'date range'): Promise<void> {
    const sample = await this.captureLatestTransaction();
    await this.openSearchPage(sample.accountId);

    if (field === 'id') {
      await this.submitSearch('transactionId', sample.id);
    } else if (field === 'date') {
      await this.submitSearch('transactionDate', sample.date);
    } else if (field === 'amount') {
      await this.submitSearch('amount', sample.amount);
    } else {
      await this.submitDateRange(sample.date, sample.date);
    }
  }

  async searchDateRange(fromDate: string, toDate: string): Promise<void> {
    const sample = await this.captureLatestTransaction();
    await this.openSearchPage(sample.accountId);
    await this.submitDateRange(fromDate, toDate);
  }

  async searchDateRangeEdge(edgeCase: string): Promise<void> {
    const sample = await this.captureLatestTransaction();
    await this.openSearchPage(sample.accountId);
    let fromDate = sample.date;
    let toDate = sample.date;

    if (edgeCase === 'end before start') {
      const [month, day, year] = sample.date.split('-').map(Number);
      const previousDay = new Date(year, month - 1, day - 1);
      toDate = `${String(previousDay.getMonth() + 1).padStart(2, '0')}-${String(previousDay.getDate()).padStart(2, '0')}-${previousDay.getFullYear()}`;
    } else if (edgeCase === 'invalid date format') {
      fromDate = '2026/99/99';
      toDate = sample.date;
    } else if (edgeCase === 'future date') {
      fromDate = '12-30-2099';
      toDate = '12-31-2099';
    } else if (edgeCase !== 'start equals end') {
      throw new Error(`Unsupported date range edge case: ${edgeCase}`);
    }

    await this.submitDateRange(fromDate, toDate);
  }

  async searchAmount(amount: string): Promise<void> {
    const sample = await this.captureLatestTransaction();
    await this.openSearchPage(sample.accountId);
    await this.submitSearch('amount', amount);
  }

  async expectSearchResults(): Promise<void> {
    await expect(this.page.locator('#transactionTable tbody tr')).not.toHaveCount(0, { timeout: 15000 });
  }

  async expectEmptySearchResults(): Promise<void> {
    const rows = this.page.locator('#transactionTable tbody tr');
    const rowCount = await rows.count();
    const bodyText = await this.page.locator('body').innerText();
    expect(rowCount === 0 || /no transactions found|no results|no matching transactions/i.test(bodyText)).toBeTruthy();
  }

  async expectDateRangeRejected(): Promise<void> {
    const bodyText = await this.page.locator('body').innerText();
    const rowCount = await this.page.locator('#transactionTable tbody tr').count();
    expect(rowCount === 0 || /invalid date|date range|must be|no transactions found/i.test(bodyText)).toBeTruthy();
  }

  async seedAndVerifyHighVolume(count = 51): Promise<void> {
    await this.seedBillPayments(count);
    await this.accountsPage.clickAccountsOverviewLink();
    await this.accountsPage.clickAccountNumberLink();

    const rows = this.page.locator('#transactionTable tbody tr');
    await expect(rows).toHaveCount(count, { timeout: 30000 });
    const transactionIds = await rows.evaluateAll((tableRows) => tableRows.map((row) => {
      const link = row.querySelector<HTMLAnchorElement>('a[href*="transaction.htm"]');
      return link?.href.match(/[?&]id=([^&]+)/)?.[1] ?? '';
    }));
    expect(transactionIds.every(Boolean)).toBeTruthy();
    expect(new Set(transactionIds).size).toBe(count);

    const dates = await rows.locator('td').first().allTextContents();
    const timestamps = dates.map((date) => Date.parse(date.trim())).filter(Number.isFinite);
    expect(timestamps).toHaveLength(count);
    for (let index = 1; index < timestamps.length; index++) {
      expect(timestamps[index - 1]).toBeGreaterThanOrEqual(timestamps[index]);
    }

    const nextPage = this.page.locator('#transactionTable_next, a[aria-label="Next"], button[aria-label="Next"]');
    if (await nextPage.count()) {
      await expect(nextPage).toBeDisabled();
    }
  }

  private async captureLatestTransaction(): Promise<TransactionSample> {
    await this.accountsPage.clickAccountsOverviewLink();
    await this.accountsPage.clickAccountNumberLink();

    const rows = this.page.locator('#transactionTable tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });
    const row = rows.first();
    const cells = await row.locator('td').allTextContents();
    const href = await row.locator('a[href*="transaction.htm"]').getAttribute('href');
    const transactionId = href?.match(/[?&]id=([^&]+)/)?.[1];
    const date = cells[0]?.trim();
    const amount = cells[2]?.trim() || cells[3]?.trim();
    const accountId = new URL(this.page.url()).searchParams.get('id');

    if (!transactionId || !date || !amount || !accountId) {
      throw new Error('Could not read the latest transaction ID, date, amount, and account from account activity.');
    }

    this.latestTransaction = { id: transactionId, date, amount: amount.replace(/[$,]/g, ''), accountId };
    return this.latestTransaction;
  }

  private async openSearchPage(accountId: string): Promise<void> {
    await this.page.getByRole('link', { name: /find transactions/i }).click();
    const accountSelect = this.page.locator('#accountId');
    if (await accountSelect.count()) {
      const optionExists = await accountSelect.locator(`option[value="${accountId}"]`).count();
      if (optionExists) await accountSelect.selectOption(accountId);
    }
  }

  private async submitSearch(fieldId: string, value: string): Promise<void> {
    const field = this.page.locator(`#${fieldId}`);
    await field.fill(value);
    const buttonId: Record<string, string> = {
      transactionId: 'findById',
      transactionDate: 'findByDate',
      amount: 'findByAmount',
    };
    await this.page.locator(`#${buttonId[fieldId]}`).click();
  }

  private async submitDateRange(fromDate: string, toDate: string): Promise<void> {
    await this.page.locator('#fromDate').fill(fromDate);
    await this.page.locator('#toDate').fill(toDate);
    await this.page.locator('#findByDateRange').click();
  }
}