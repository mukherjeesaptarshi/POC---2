import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";

import { expect } from "@playwright/test";
import { CustomWorld } from "../../support/world";
setDefaultTimeout(120000);

Given(
  "I wait for the access token to expire",
  async function (this: CustomWorld) {
    const parts = this.accessToken.split(".");

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    );

    const timeout = Math.max(0, payload.exp * 1000 - Date.now()) + 5000;
    await expect
      .poll(
        async () =>
          (
            await this.accountService.getAccount(
              "ACC-001",
              this.accessToken,
            )
          ).status(),
        { timeout, intervals: [100, 250, 500, 1000] },
      )
      .toBe(401);
  },
);

/**
 * Refresh access token
 */
When("I refresh the access token", async function (this: CustomWorld) {
  this.response = await this.authService.refreshToken(this.refreshToken);

  const body = await this.response.json();

  if (this.response.status() === 200) {
    this.newAccessToken = body.accessToken;

    this.refreshToken = body.refreshToken;
  } else {
    this.errorBody = body;
  }
});

/**
 * Verify new access token
 */
Then("a new access token should be returned", function (this: CustomWorld) {
  expect(this.newAccessToken).toBeDefined();

  expect(this.newAccessToken).not.toBe("");
});

/**
 * Access protected API using newly refreshed token
 */
When(
  "I access customer {string} using the new access token",
  async function (this: CustomWorld, customerId: string) {
    this.response = await this.authService.getCustomer(
      customerId,
      this.newAccessToken,
    );

    if (this.response.status() !== 200) {
      this.errorBody = await this.response.json();
    }
  },
);

/**
 * Revoke current access token
 */
When("I revoke the access token", async function (this: CustomWorld) {
  this.response = await this.authService.revokeToken(
    this.accessToken,
    this.accessToken,
  );

  const body = await this.response.json();

  if (this.response.status() !== 200) {
    this.errorBody = body;
  }
});

/**
 * Access protected API with revoked token
 */
When(
  "I access customer {string} using the revoked access token",
  async function (this: CustomWorld, customerId: string) {
    this.response = await this.authService.getCustomer(
      customerId,
      this.accessToken,
    );

    this.errorBody = await this.response.json();
  },
);
