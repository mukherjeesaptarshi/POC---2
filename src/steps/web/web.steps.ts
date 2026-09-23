import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../support/world";

Given("I open the web registration page", async function (this: CustomWorld) {
  await this.registrationPage.open();
});

When("I register a new web customer", async function (this: CustomWorld) {
  this.webCredentials = await this.registrationPage.register();
});

When("I click on the Register link", async function (this: CustomWorld) {
  await this.registrationPage.clickRegisterLink();
});

When("I enter all the required details", async function (this: CustomWorld) {
  this.webCredentials = await this.registrationPage.enterRequiredDetails();
});

When(
  'I {string} on the {string} {string}',
  async function (
    this: CustomWorld,
    action: string,
    target: string,
    targetType: string,
  ) {
    if (action.toLowerCase() === "click" &&
        target.toLowerCase() === "register" &&
        targetType.toLowerCase() === "button") {
      await this.registrationPage.clickRegisterButton();
      return;
    }

    if (action.toLowerCase() === "click" &&
        target.toLowerCase() === "logout" &&
        targetType.toLowerCase() === "button") {
      await this.registrationPage.logout();
      return;
    }

    if (action.toLowerCase() === "click" &&
        target.toLowerCase() === "open new account" &&
        targetType.toLowerCase() === "button") {
      await this.accountsOverviewPage.clickOpenNewAccountButton();
      return;
    }

    if (action.toLowerCase() === "click" &&
        target.toLowerCase() === "transfer" &&
        targetType.toLowerCase() === "button") {
      await this.accountsOverviewPage.clickTransferButton();
      return;
    }

    if (action.toLowerCase() === "click" &&
        target.toLowerCase() === "send payment" &&
        targetType.toLowerCase() === "button") {
      await this.accountsOverviewPage.clickSendPaymentButton();
      return;
    }

    if (action.toLowerCase() === "click" &&
        target.toLowerCase() === "savings" &&
        targetType.toLowerCase() === "drop down") {
      await this.accountsOverviewPage.selectAccountType("SAVINGS");
      return;
    }

    throw new Error(
      `Unsupported web action: ${action} on ${target} ${targetType}`,
    );
  },
);

When(
  'I validate the {string}',
  async function (this: CustomWorld, validationTarget: string) {
    if (validationTarget.toLowerCase() === "registration message") {
      await this.registrationPage.expectRegistrationMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "error message") {
      await this.registrationPage.expectRegistrationErrorMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "rejection message") {
      await this.loginPage.expectRejectionMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "blank rejection message") {
      await this.loginPage.expectBlankCredentialsMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "success message") {
      await this.accountsOverviewPage.expectAccountOpenedMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "savings account in accounts overview") {
      await this.accountsOverviewPage.expectSavingsAccountVisibleInOverview();
      return;
    }

    if (validationTarget.toLowerCase() === "checking account in accounts overview") {
      await this.accountsOverviewPage.expectCheckingAccountVisibleInOverview();
      return;
    }

    if (validationTarget.toLowerCase() === "accounts overview total matches individual balances") {
      await this.accountsOverviewPage.expectAccountsOverviewTotalMatchesBalances();
      return;
    }

    if (validationTarget.toLowerCase() === "insufficient funding error message") {
      await this.accountsOverviewPage.expectInsufficientFundingErrorMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "bill pay success message") {
      await this.accountsOverviewPage.expectBillPaySuccessMessage();
      return;
    }

    if (validationTarget.toLowerCase().startsWith("bill pay blank ") && validationTarget.toLowerCase().endsWith(" error message")) {
      const fieldName = validationTarget
        .replace(/^bill pay blank /i, "")
        .replace(/ error message$/i, "")
        .trim();
      await this.accountsOverviewPage.expectBillPayFieldError(fieldName);
      return;
    }

    if (validationTarget.toLowerCase() === "transfer fund error message") {
      await this.accountsOverviewPage.expectTransferFundsErrorMessage();
      return;
    }

    if (validationTarget.toLowerCase() === "transfer complete message") {
      await this.accountsOverviewPage.expectTransferCompleteMessage();
      return;
    }

    throw new Error(`Unsupported web validation target: ${validationTarget}`);
  },
);

When("I click on the open new account link", async function (this: CustomWorld) {
  await this.accountsOverviewPage.clickOpenNewAccountLink();
});

When("I click on the transfer funds link", async function (this: CustomWorld) {
  await this.accountsOverviewPage.clickTransferFundsLink();
});

When("I click on the bill pay link", async function (this: CustomWorld) {
  await this.accountsOverviewPage.clickBillPayLink();
});

When('I enter {string} in the {string} textbox', async function (this: CustomWorld, value: string, fieldName: string) {
  await this.accountsOverviewPage.enterText(fieldName, value);
});

When("I fill all bill payment details", async function (this: CustomWorld) {
  await this.accountsOverviewPage.fillBillPayForm();
});

When("I open 5 new accounts sequentially", async function (this: CustomWorld) {
  await this.accountsOverviewPage.openMultipleNewAccounts(5);
});

When('I fill all bill payment details except the {string} field', async function (this: CustomWorld, fieldName: string) {
  await this.accountsOverviewPage.fillBillPayForm(fieldName);
});

When("I attempt to open an account with insufficient funding balance", async function (this: CustomWorld) {
  await this.accountsOverviewPage.attemptOpenAccountWithInsufficientFundingBalance();
});

When('I select the {string} from the {string} dropdown', async function (this: CustomWorld, optionLabel: string, fieldName: string) {
  await this.accountsOverviewPage.selectDropdownOption(fieldName, optionLabel);
});

When("I click the browser back button", async function (this: CustomWorld) {
  await this.loginPage.goBack();
});

When('I register leaving the {string} field blank', async function (this: CustomWorld, fieldName: string) {
  await this.registrationPage.open();
  await this.registrationPage.clickRegisterLink();
  await this.registrationPage.fillRegistrationForm({
    firstName: fieldName === 'first name' ? '' : 'Web',
    lastName: fieldName === 'last name' ? '' : 'Smoke',
    address: fieldName === 'address' ? '' : '1 Test Street',
    city: fieldName === 'city' ? '' : 'Sydney',
    state: fieldName === 'state' ? '' : 'NSW',
    zipCode: fieldName === 'zip code' ? '' : '2000',
    phoneNumber: fieldName === 'phone number' ? '' : '0400000000',
    ssn: fieldName === 'ssn' ? '' : '123456789',
    username: fieldName === 'username' ? '' : `webuser${Date.now()}`,
    password: fieldName === 'password' ? '' : 'Password123!',
    confirmPassword: fieldName === 'password' ? '' : 'Password123!',
  });
  await this.registrationPage.clickRegisterButton();
});

Then('I validate the blank {string} field error message', async function (this: CustomWorld, fieldName: string) {
  await this.registrationPage.expectBlankFieldError(fieldName);
});

// Then("I logout from the account", async function (this: CustomWorld) {
//   await this.registrationPage.logout();
// });

When("I have registered a new web customer", async function (this: CustomWorld) {
  this.webCredentials = await this.registrationPage.register();
});

Given("I open the web login page", async function (this: CustomWorld) {
  await this.loginPage.open();
});

// When("I log out of the web application", async function (this: CustomWorld) {
//   await this.loginPage.logout();
// });

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
  "the Accounts Overview total equals the sum of all individual balances",
  async function (this: CustomWorld) {
    await this.accountsOverviewPage.expectAccountsOverviewTotalMatchesBalances();
  },
);

Then(
  "the web login should be rejected",
  async function (this: CustomWorld) {
    await this.loginPage.expectInvalidCredentials();
    await expect(this.webPage).toHaveURL(/index\.htm/);
  },
);

Then(
  "the protected page should be inaccessible after logout",
  async function (this: CustomWorld) {
    await this.loginPage.expectProtectedPageInaccessibleAfterLogout();
  },
);