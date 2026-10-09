import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { auditAccessibility, type AccessibilityAuditArtifacts } from "../../../utils/accessibility";
import { getWebBaseUrl } from "../../config/env";
import { CustomWorld } from "../../support/world";

const auditArtifacts = new WeakMap<CustomWorld, AccessibilityAuditArtifacts>();

Given(
  "I open the {string} page for accessibility review",
  async function (this: CustomWorld, pagePath: string) {
    const baseUrl = `${getWebBaseUrl().replace(/\/+$/, "")}/`;
    const targetUrl = new URL(pagePath.replace(/^\/+/, ""), baseUrl);
    const response = await this.webPage.goto(targetUrl.toString());
    expect(response?.status()).toBeLessThan(400);
  },
);

When("I run an accessibility audit", async function (this: CustomWorld) {
  const browserName = process.env.WEB_BROWSER ?? this.webBrowser.browserType().name();
  const artifacts = await auditAccessibility(this.webPage, browserName);
  auditArtifacts.set(this, artifacts);

  if (
    process.env.ACCESSIBILITY_FAIL_ON_VIOLATIONS === "true" &&
    artifacts.violationCount > 0
  ) {
    throw new Error(
      `Accessibility audit found ${artifacts.violationCount} violation(s). See ${artifacts.htmlPath}`,
    );
  }
});

Then(
  "accessibility violation artifacts should be generated",
  function (this: CustomWorld) {
    const artifacts = auditArtifacts.get(this);
    expect(artifacts, "Accessibility audit did not run").toBeDefined();
    expect(existsSync(artifacts!.jsonPath)).toBeTruthy();
    expect(existsSync(artifacts!.htmlPath)).toBeTruthy();
    expect(existsSync(artifacts!.logPath)).toBeTruthy();
  },
);