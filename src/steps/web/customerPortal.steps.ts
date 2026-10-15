import { Given, Then, When } from "@cucumber/cucumber";
import { randomUUID } from "node:crypto";
import { CustomerCareRequest, CustomerProfile } from "../../../tests/web/pages/customerPortalPage";
import { CustomWorld } from "../../support/world";

const registeredProfile: CustomerProfile = {
  firstName: "Web",
  lastName: "Smoke",
  address: "1 Test Street",
  city: "Sydney",
  state: "NSW",
  zipCode: "2000",
  phoneNumber: "0400000000",
};

const lookupDetails = { ...registeredProfile, ssn: "123456789" };

function profileField(value: string): keyof CustomerProfile {
  const fields: Record<string, keyof CustomerProfile> = {
    "first name": "firstName",
    "last name": "lastName",
    address: "address",
    city: "city",
    state: "state",
    "zip code": "zipCode",
    "phone number": "phoneNumber",
  };
  const field = fields[value.toLowerCase().trim()];
  if (!field) throw new Error(`Unsupported profile field: ${value}`);
  return field;
}

function careField(value: string): keyof CustomerCareRequest {
  const field = value.toLowerCase().trim();
  if (field === "name" || field === "email" || field === "phone" || field === "message") return field;
  throw new Error(`Unsupported customer-care field: ${value}`);
}

Given("I open the customer lookup page", async function (this: CustomWorld) {
  await this.customerPortalPage.openLookup();
});

When("I find login info using my registered customer details", async function (this: CustomWorld) {
  await this.customerPortalPage.fillLookup(lookupDetails);
  debugger;
  await this.customerPortalPage.submitLookup();
});

When("I find login info leaving the {string} field blank", async function (this: CustomWorld, field: string) {
  await this.customerPortalPage.fillLookup(lookupDetails, profileField(field));
  await this.customerPortalPage.submitLookup();
});

When("I search login info with incorrect customer details", async function (this: CustomWorld) {
  await this.customerPortalPage.fillLookup({ ...lookupDetails, lastName: `Missing-${randomUUID()}` });
  await this.customerPortalPage.submitLookup();
});

When("I search login info with whitespace-padded customer details", async function (this: CustomWorld) {
  const paddedDetails = Object.fromEntries(
    Object.entries(lookupDetails).map(([key, value]) => [key, `  ${value}  `]),
  ) as typeof lookupDetails;
  await this.customerPortalPage.fillLookup(paddedDetails);
  await this.customerPortalPage.submitLookup();
});

Then("the recovered login credentials should be displayed", async function (this: CustomWorld) {
  await this.customerPortalPage.expectRecoveredCredentials(this.webCredentials);
});

Then("the lookup form should require the {string} field", async function (this: CustomWorld, field: string) {
  await this.customerPortalPage.expectLookupRequired(profileField(field));
});

Then("the lookup should report that the customer was not found", async function (this: CustomWorld) {
  await this.customerPortalPage.expectCustomerNotFound();
});

When("I update my profile phone number to {string}", async function (this: CustomWorld, phoneNumber: string) {
  await this.customerPortalPage.openProfile();
  const updatedProfile = { ...registeredProfile, phoneNumber };
  await this.customerPortalPage.fillProfile(updatedProfile);
  await this.customerPortalPage.saveProfile(updatedProfile);
});

When("I update my profile address to {string}", async function (this: CustomWorld, address: string) {
  await this.customerPortalPage.openProfile();
  const updatedProfile = { ...registeredProfile, address };
  await this.customerPortalPage.fillProfile(updatedProfile);
  await this.customerPortalPage.saveProfile(updatedProfile);
});

When("I submit my profile with the {string} field blank", async function (this: CustomWorld, field: string) {
  await this.customerPortalPage.openProfile();
  await this.customerPortalPage.fillProfile(registeredProfile, profileField(field));
  await this.customerPortalPage.saveProfile();
});

When("I update my profile ZIP code to {string}", async function (this: CustomWorld, zipCode: string) {
  await this.customerPortalPage.openProfile();
  await this.customerPortalPage.fillProfile({ ...registeredProfile, zipCode });
  await this.customerPortalPage.saveProfile();
});

When("I update multiple profile fields", async function (this: CustomWorld) {
  await this.customerPortalPage.openProfile();
  const updatedProfile = {
    ...registeredProfile,
    firstName: "Updated",
    address: "99 New Street",
    phoneNumber: "0400999888",
  };
  await this.customerPortalPage.fillProfile(updatedProfile);
  await this.customerPortalPage.saveProfile(updatedProfile);
});

Then("the profile update should be saved", async function (this: CustomWorld) {
  await this.customerPortalPage.expectProfileSaved();
});

Then("the profile should show the required validation for {string}", async function (this: CustomWorld, field: string) {
  await this.customerPortalPage.expectProfileRequired(profileField(field));
});

Then("the profile should show ZIP code validation", async function (this: CustomWorld) {
  await this.customerPortalPage.expectProfileZipCodeValidation();
});

When("I log out and sign back in", async function (this: CustomWorld) {
  await this.registrationPage.logout();
  await this.loginPage.open();
  await this.loginPage.login(this.webCredentials.username, this.webCredentials.password);
});

Then("the saved profile values should be retained", async function (this: CustomWorld) {
  await this.customerPortalPage.expectSubmittedProfileValues();
});

Given("I open the customer care page", async function (this: CustomWorld) {
  await this.customerPortalPage.openCustomerCare();
});

When("I submit a valid customer care request", async function (this: CustomWorld) {
  await this.customerPortalPage.fillCustomerCare({
    name: "Web Customer",
    email: "web.customer@example.com",
    phone: "0400123456",
    message: "Please contact me about my account.",
  });
  await this.customerPortalPage.submitCustomerCare();
});

When("I submit a customer care request with {string} blank", async function (this: CustomWorld, field: string) {
  const request: CustomerCareRequest = {
    name: "Web Customer",
    email: "web.customer@example.com",
    phone: "0400123456",
    message: "Please contact me about my account.",
  };
  await this.customerPortalPage.fillCustomerCare(request, careField(field));
  await this.customerPortalPage.submitCustomerCare();
});

When("I submit a customer care request with an invalid email", async function (this: CustomWorld) {
  await this.customerPortalPage.fillCustomerCare({
    name: "Web Customer",
    email: "not-an-email",
    phone: "0400123456",
    message: "Please contact me about my account.",
  });
  await this.customerPortalPage.submitCustomerCare();
});

When("I submit a customer care request with a very large message", async function (this: CustomWorld) {
  await this.customerPortalPage.fillCustomerCare({
    name: "Web Customer",
    email: "web.customer@example.com",
    phone: "0400123456",
    message: "Please review this request. ".repeat(1000),
  });
  await this.customerPortalPage.submitCustomerCare();
});

Then("the customer care request should be accepted", async function (this: CustomWorld) {
  await this.customerPortalPage.expectCustomerCareSuccess();
});

Then("the customer care form should require {string}", async function (this: CustomWorld, field: string) {
  await this.customerPortalPage.expectCustomerCareRequired(careField(field));
});

Then("the customer care form should report an invalid email", async function (this: CustomWorld) {
  await this.customerPortalPage.expectInvalidCustomerCareEmail();
});

Then("the large customer care request should be handled gracefully", async function (this: CustomWorld) {
  await this.customerPortalPage.expectCustomerCareHandledGracefully();
});