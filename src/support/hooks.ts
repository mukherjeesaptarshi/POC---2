import { Before, After } from "@cucumber/cucumber";

import { CustomWorld } from "./world";

Before(async function (this: CustomWorld) {
  await this.initialize();
});

Before({ tags: "@web" }, async function (this: CustomWorld) {
  await this.initializeWeb();
});

After(async function (this: CustomWorld) {
  await this.dispose();
});

After({ tags: "@web" }, async function (this: CustomWorld) {
  await this.disposeWeb();
});
