import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { cleanupRegistry } from "../src/support/cleanupRegistry";
import DataFactoryService from "@src/services/dataFactoryService";
import { getApiConfig } from "@src/config/env";
import AuthService from "@src/services/authService";

export { expect };

type Fixtures = {
  apiRequest: APIRequestContext;
  apiAuthService: AuthService;
  apiDataFactory: DataFactoryService;
  cleanupRegistry: cleanupRegistry;
};

export const test = base.extend<Fixtures>({
  apiRequest: async ({}, use) => {
    const { request } = await import("@playwright/test");
    const config = getApiConfig();
    const context = await request.newContext({
      baseURL: config.baseUrl,
    });
    await use(context);
    await context.dispose();
  },

  apiAuthService: async ({ apiRequest }, use) => {
    await use(new AuthService(apiRequest));
  },

  apiDataFactory: async ({ apiRequest }, use) => {
    await use(new DataFactoryService(apiRequest));
  },

  cleanupRegistry: async ({}, use) => {
    console.log("Initializing Cleanup Registry");

    const registry = new cleanupRegistry();

    await use(registry);

    console.log("Executing Cleanup Registry");

    await registry.cleanupAll();
  },
});
