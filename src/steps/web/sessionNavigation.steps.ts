import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../support/world";

function appUrl(world: CustomWorld, path: string): string {
  return new URL(`/parabank/${path}`, world.webPage.url()).toString();
}

async function expectLoginPage(world: CustomWorld): Promise<void> {
  await expect(world.webPage.locator('input[name="username"]')).toBeVisible();
  await expect(world.webPage.locator('input[name="password"]')).toBeVisible();
}

Given("I open the signed-in web application", async function (this: CustomWorld) {
  await this.registrationPage.open();
  this.webCredentials = await this.registrationPage.register();
});

When("I simulate an idle session expiration", async function (this: CustomWorld) {
  await this.webPage.waitForTimeout(Number(process.env.WEB_IDLE_TIMEOUT_MS ?? 1000));
  await this.webContext.clearCookies();
  await this.webPage.goto(appUrl(this, "transfer.htm"));
});

When("I click log out multiple times", async function (this: CustomWorld) {
  await this.registrationPage.logout();
  await this.webPage.goto(appUrl(this, "logout.htm"));
});

When("I refresh the page after logging out", async function (this: CustomWorld) {
  await this.registrationPage.logout();
  await this.webPage.reload();
});

When("I open the protected {string} URL without signing in", async function (this: CustomWorld, pagePath: string) {
  await this.webPage.goto(appUrl(this, pagePath));
});

Then("the web application should show the login page", async function (this: CustomWorld) {
  await expectLoginPage(this);
});

Then("repeated logout should not show an application error", async function (this: CustomWorld) {
  await expectLoginPage(this);
  await expect(this.webPage.locator("body")).not.toContainText(/internal server error|exception|stack trace/i);
});

When("I verify the Account Services navigation links", async function (this: CustomWorld) {
  const links = [
    /open new account/i,
    /accounts overview/i,
    /transfer funds/i,
    /bill pay/i,
    /find transactions/i,
    /update contact info/i,
    /request loan/i,
  ];
  for (const name of links) {
    await expect(this.webPage.getByRole("link", { name })).toBeVisible();
  }
});

When("I navigate home using the Home link", async function (this: CustomWorld) {
  await this.webPage.locator('#footerPanel a[href="index.htm"]').click();
});

Then("the ParaBank landing page should be displayed", async function (this: CustomWorld) {
  await expect(this.webPage).toHaveURL(/\/parabank\/index\.htm/);
  await expect(this.webPage.locator("#loginPanel")).toBeVisible();
});

Then("the Customer Care page should be displayed", async function (this: CustomWorld) {
  await expect(this.webPage).toHaveURL(/contact\.htm/);
  await expect(this.webPage.getByRole("heading", { name: /customer care/i })).toBeVisible();
});

When("I open the site map", async function (this: CustomWorld) {
  await this.webPage.goto(appUrl(this, "sitemap.htm"));
});

Then("all internal site map links should respond successfully", async function (this: CustomWorld) {
  const links = await this.webPage.locator("#rightPanel a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
  );
  const internalLinks = [...new Set(links.filter((href) => new URL(href).pathname.startsWith("/parabank/")))];
  expect(internalLinks.length).toBeGreaterThan(0);

  for (const href of internalLinks) {
    const response = await this.webContext.request.get(href);
    expect(response.status(), href).toBeLessThan(400);
  }
});

When("I navigate to Customer Care from the site map and use browser history", async function (this: CustomWorld) {
  await this.webPage.locator('#rightPanel a[href*="contact.htm"]').click();
  await expect(this.webPage).toHaveURL(/contact\.htm/);
  await this.webPage.goBack();
  await expect(this.webPage).toHaveURL(/sitemap\.htm/);
  await this.webPage.goForward();
  await expect(this.webPage).toHaveURL(/contact\.htm/);
});

When("I sign in to the same customer in a second browser context", async function (this: CustomWorld) {
  const secondContext = await this.webBrowser.newContext();
  try {
    const secondPage = await secondContext.newPage();
    await secondPage.goto(appUrl(this, "index.htm"));
    await secondPage.locator('input[name="username"]').fill(this.webCredentials.username);
    await secondPage.locator('input[name="password"]').fill(this.webCredentials.password);
    await secondPage.getByRole("button", { name: /log in/i }).click();
    await expect(secondPage.getByRole("heading", { name: /accounts overview/i })).toBeVisible();
    await expect(this.webPage.getByRole("heading", { name: /accounts overview/i })).toBeVisible();
  } finally {
    await secondContext.close();
  }
});