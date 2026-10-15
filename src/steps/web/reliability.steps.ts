import { Given, Then, When } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";

Given("I prepare two accounts and open Transfer Funds", async function (this: CustomWorld) {
  await this.accountsOverviewPage.openMultipleNewAccounts(1);
  await this.accountsOverviewPage.clickTransferFundsLink();
});

When("I double-submit a transfer of {string} to the second account", async function (this: CustomWorld, amount: string) {
  await this.accountsOverviewPage.doubleSubmitTransfer(amount);
});

Then("the transfer should be applied only once", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectDebitAndCreditInBothAccounts();
});

When("I submit a {string} transfer and refresh during processing", async function (this: CustomWorld, amount: string) {
  await this.accountsOverviewPage.submitTransferAndRefresh(amount);
});

Then("the refreshed transfer should not be applied more than once", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectTransferAppliedAtMostOnce();
});

When("I submit a bill payment and refresh during processing", async function (this: CustomWorld) {
  await this.accountsOverviewPage.clickBillPayLink();
  await this.accountsOverviewPage.submitBillPaymentAndRefresh();
});

Then("the refreshed bill payment should not be duplicated", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectBillPaymentAppliedAtMostOnce();
});