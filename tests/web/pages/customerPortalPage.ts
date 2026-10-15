import { expect, type Page } from "@playwright/test";
import { navigateWithRetry } from "../../../utils/pageNavigation";
import type { RegistrationCredentials } from "./registrationPage";

export type CustomerProfile = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
};

export type CustomerCareRequest = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const profileFields: Record<keyof CustomerProfile, string> = {
  firstName: "customer.firstName",
  lastName: "customer.lastName",
  address: "customer.address.street",
  city: "customer.address.city",
  state: "customer.address.state",
  zipCode: "customer.address.zipCode",
  phoneNumber: "customer.phoneNumber",
};

const profileLabels: Record<keyof CustomerProfile, string> = {
  firstName: "First name",
  lastName: "Last name",
  address: "Address",
  city: "City",
  state: "State",
  zipCode: "Zip code",
  phoneNumber: "Phone number",
};

export class CustomerPortalPage {
  private submittedProfile?: CustomerProfile;

  constructor(private readonly page: Page) {}

  async openLookup(): Promise<void> {
    await navigateWithRetry(this.page, "/parabank/lookup.htm");
    await expect(this.page.getByRole("heading", { name: /customer lookup/i })).toBeVisible();
  }

  async fillLookup(details: CustomerProfile & { ssn: string }, omitField?: keyof CustomerProfile): Promise<void> {
    const values: Record<string, string> = {
      firstName: details.firstName,
      lastName: details.lastName,
      "address.street": details.address,
      "address.city": details.city,
      "address.state": details.state,
      "address.zipCode": details.zipCode,
      ssn: details.ssn,
    };

    for (const [field, value] of Object.entries(values)) {
      if (field === omitField) continue;
      await this.page.locator(`input[name="${field}"]`).fill(value);
    }
  }

  async submitLookup(): Promise<void> {
    await this.page.getByRole("button", { name: /find my login info/i }).click();
  }

  async expectRecoveredCredentials(credentials: RegistrationCredentials): Promise<void> {
    const body = this.page.locator("body");
    await expect(body).toContainText(/login information was located successfully/i);
    await expect(body).toContainText(credentials.username);
    await expect(body).toContainText(credentials.password);
  }

  async expectLookupRequired(field: keyof CustomerProfile): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      new RegExp(`${profileLabels[field]} is required`, "i"),
    );
  }

  async expectCustomerNotFound(): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      /could not be found|could not be verified|no customer|not found/i,
    );
  }

  async openProfile(): Promise<void> {
    await navigateWithRetry(this.page, "/parabank/updateprofile.htm");
    await expect(this.page.locator(`input[name="${profileFields.firstName}"]`)).toBeVisible();
  }

  async fillProfile(profile: CustomerProfile, omitField?: keyof CustomerProfile): Promise<void> {
    for (const field of Object.keys(profileFields) as Array<keyof CustomerProfile>) {
      if (field === omitField) continue;
      await this.page.locator(`input[name="${profileFields[field]}"]`).fill(profile[field]);
    }
  }

  async saveProfile(expectedProfile?: CustomerProfile): Promise<void> {
    await this.page.getByRole("button", { name: /update profile/i }).click();
    this.submittedProfile = expectedProfile;
  }

  async expectProfileSaved(): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      /updated address and phone number have been added to the system|profile updated/i,
    );
  }

  async expectProfileValues(profile: CustomerProfile): Promise<void> {
    for (const field of Object.keys(profileFields) as Array<keyof CustomerProfile>) {
      await expect(this.page.locator(`input[name="${profileFields[field]}"]`)).toHaveValue(profile[field]);
    }
  }

  async expectSubmittedProfileValues(): Promise<void> {
    if (!this.submittedProfile) throw new Error("No profile values were saved for verification.");
    await this.openProfile();
    await this.expectProfileValues(this.submittedProfile);
  }

  async expectProfileRequired(field: keyof CustomerProfile): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      new RegExp(`${profileLabels[field]} is required`, "i"),
    );
  }

  async expectProfileZipCodeValidation(): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      /zip(code)? .*(invalid|required|valid|format)|invalid .*zip(code)?/i,
    );
  }

  async openCustomerCare(): Promise<void> {
    await navigateWithRetry(this.page, "/parabank/contact.htm");
    await expect(this.page.getByRole("heading", { name: /customer care/i })).toBeVisible();
  }

  async fillCustomerCare(request: CustomerCareRequest, omitField?: keyof CustomerCareRequest): Promise<void> {
    for (const field of ["name", "email", "phone", "message"] as const) {
      if (field === omitField) continue;
      await this.page.locator(`[name="${field}"]`).fill(request[field]);
    }
  }

  async submitCustomerCare(): Promise<void> {
    await this.page.getByRole("button", { name: /send to customer care/i }).click();
  }

  async expectCustomerCareSuccess(): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      /thank you|customer care representative|message has been sent|successfully/i,
    );
  }

  async expectCustomerCareRequired(field: keyof CustomerCareRequest): Promise<void> {
    const labels: Record<keyof CustomerCareRequest, string> = {
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
    };
    await expect(this.page.locator("body")).toContainText(
      new RegExp(`${labels[field]} is required`, "i"),
    );
  }

  async expectInvalidCustomerCareEmail(): Promise<void> {
    await expect(this.page.locator("body")).toContainText(/email.*(invalid|valid)|invalid.*email/i);
  }

  async expectCustomerCareHandledGracefully(): Promise<void> {
    await expect(this.page.locator("body")).not.toContainText(/internal server error|stack trace|exception/i);
    await expect(this.page.locator("body")).toContainText(/customer care|thank you|message/i);
  }
}