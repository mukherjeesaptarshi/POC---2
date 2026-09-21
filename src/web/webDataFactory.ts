import { APIRequestContext, expect, request } from "@playwright/test";
import {
  getWebBaseUrl,
  shouldIgnoreWebHttpsErrors,
} from "../config/env";
import { RegistrationCredentials } from "../../tests/web/pages/registrationPage";

export class WebDataFactory {
  private requestContext?: APIRequestContext;

  async createCustomer(): Promise<RegistrationCredentials> {
    this.requestContext = await request.newContext({
      baseURL: getWebBaseUrl(),
      ignoreHTTPSErrors: shouldIgnoreWebHttpsErrors(),
    });

    const credentials: RegistrationCredentials = {
      username: `webapi${Date.now()}`,
      password: "Password123!",
    };

    const response = await this.requestContext.post("/parabank/register.htm", {
      form: {
        "customer.firstName": "Web",
        "customer.lastName": "ApiSeed",
        "customer.address.street": "1 Test Street",
        "customer.address.city": "Sydney",
        "customer.address.state": "NSW",
        "customer.address.zipCode": "2000",
        "customer.phoneNumber": "0400000000",
        "customer.ssn": "123456789",
        "customer.username": credentials.username,
        "customer.password": credentials.password,
        repeatedPassword: credentials.password,
      },
    });

    const responseBody = await response.text();
    expect(
      response.ok(),
      `Web data seed failed: ${response.status()} ${responseBody.slice(0, 500)}`,
    ).toBeTruthy();
    expect(responseBody).toMatch(/welcome|account overview|successfully/i);
    return credentials;
  }

  async dispose(): Promise<void> {
    await this.requestContext?.dispose();
  }
}