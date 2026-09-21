import { test as playwrightTest } from '@playwright/test';
import { AccountsOverviewPage } from './pages/accountsOverviewPage';
import { LoginPage } from './pages/loginPage';
import { RegistrationPage } from './pages/registrationPage';
import { WebDataFactory } from '../../src/web/webDataFactory';

type WebFixtures = {
  loginPage: LoginPage;
  accountsOverviewPage: AccountsOverviewPage;
  registrationPage: RegistrationPage;
  webDataFactory: WebDataFactory;
};

export const test = playwrightTest.extend<WebFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountsOverviewPage: async ({ page }, use) => use(new AccountsOverviewPage(page)),
  registrationPage: async ({ page }, use) => use(new RegistrationPage(page)),
  webDataFactory: async ({}, use) => {
    const factory = new WebDataFactory();
    await use(factory);
    await factory.dispose();
  },
});

export { expect } from '@playwright/test';