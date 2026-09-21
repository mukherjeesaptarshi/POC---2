import { APILogger } from '../../utils/logger';
import { test } from './baseTest';

test.describe('Web smoke pack', () => {
  test.beforeEach(async ({ page }) => {
    APILogger.info(`Starting web test at ${page.url() || 'configured base URL'}`);
  });

  test('valid registration auto-logs in and shows a default account with a balance', async ({ registrationPage, accountsOverviewPage }) => {
    await registrationPage.open();
    await registrationPage.register();
    await accountsOverviewPage.expectLoadedWithDefaultAccount();
  });

  test('valid credentials log in successfully', async ({ webDataFactory, loginPage, accountsOverviewPage }) => {
    const credentials = await webDataFactory.createCustomer();
    await loginPage.open();
    await loginPage.login(credentials.username, credentials.password);
    await accountsOverviewPage.expectLoadedWithDefaultAccount();
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('unknown-web-user', 'WrongPassword123!');
    await loginPage.expectInvalidCredentials();
  });

  test('blank credentials are rejected', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('', '');
    await loginPage.expectInvalidCredentials();
  });
});