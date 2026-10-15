import { Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";

Then("the default account details should be displayed", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectDefaultAccountDetailsDisplayed();
});

Then("the opening balance should reconcile with account activity", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectOpeningBalanceReconciles();
});

Then("the transfer should be visible in both account activities", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectTransferEntriesInBothActivities();
});

Then("the bill payment should be visible in account activity", async function (this: CustomWorld) {
  await this.accountsOverviewPage.expectBillPaymentInActivity();
});