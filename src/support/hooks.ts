import { Before, After } from "@cucumber/cucumber";

import { CustomWorld } from "./world";

Before(async function (this: CustomWorld) {
  await this.initialize();
});

Before({ tags: "@web" }, async function (this: CustomWorld) {
  await this.initializeWeb();
});

After(async function (this: CustomWorld, { result }) {
  try {
    if (
      result?.status === "FAILED" &&
      this.webPage &&
      !this.webPage.isClosed()
    ) {
      try {
        await this.attach(await this.webPage.screenshot({ fullPage: true }), "image/png");
      } catch (error) {
        console.error("Failed to attach failure screenshot:", error);
      }
    }

    await this.dispose();
  } finally {
    await this.disposeWeb();
  }
});
