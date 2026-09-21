import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../support/world";

Given("I open the web registration page", async function (this: CustomWorld) {
  await this.registrationPage.open();
});

When("I register a new web customer", async function (this: CustomWorld) {
  this.webCredentials = await this.registrationPage.register();
});

Given("I have registered a new web customer", async function (this: CustomWorld) {
  this.webCredentials = await this.webDataFactory.createCustomer();
});

Given("I open the web login page", async function (this: CustomWorld) {
  await this.loginPage.open();
});

When("I log out of the web application", async function (this: CustomWorld) {
  await this.loginPage.logout();
});

When("I log in with the registered web credentials", async function (this: CustomWorld) {
  await this.loginPage.login(
    this.webCredentials.username,
    this.webCredentials.password,
  );
});

When(
  "I log in to the web application with username {string} and password {string}",
  async function (this: CustomWorld, username: string, password: string) {
    await this.loginPage.login(username, password);
  },
);

Then(
  "the web Accounts Overview should show a default account with a non-null balance",
  async function (this: CustomWorld) {
    await this.accountsOverviewPage.expectLoadedWithDefaultAccount();
  },
);

Then(
  "the web login should be rejected",
  async function (this: CustomWorld) {
    await this.loginPage.expectInvalidCredentials();
    await expect(this.webPage).toHaveURL(/index\.htm/);
  },
);