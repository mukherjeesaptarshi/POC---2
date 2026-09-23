const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator("//div[@id='loginPanel']/p[2]/a").click();
  const username = 'webuser' + Date.now();
  const password = 'Password123!';
  await page.locator("input[name='customer.firstName']").fill('Web');
  await page.locator("input[name='customer.lastName']").fill('Smoke');
  await page.locator("input[name='customer.address.street']").fill('1 Test Street');
  await page.locator("input[name='customer.address.city']").fill('Sydney');
  await page.locator("input[name='customer.address.state']").fill('NSW');
  await page.locator("input[name='customer.address.zipCode']").fill('2000');
  await page.locator("input[name='customer.phoneNumber']").fill('0400000000');
  await page.locator("input[name='customer.ssn']").fill('123456789');
  await page.locator("input[name='customer.username']").fill(username);
  await page.locator("input[name='customer.password']").fill(password);
  await page.locator("input[name='repeatedPassword']").fill(password);
  await page.getByRole('button', { name: /register/i }).click();
  await page.waitForTimeout(2000);
  for (let i = 0; i < 5; i++) {
    await page.getByRole('link', { name: /open new account/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /open new account/i }).click();
    await page.waitForTimeout(1500);
    console.log('opened', i + 1, 'page url', page.url());
    if (i < 4) {
      await page.getByRole('link', { name: /open new account/i }).click();
      await page.waitForTimeout(1000);
    }
  }
  await page.getByRole('link', { name: /accounts overview/i }).click();
  await page.waitForTimeout(1500);
  console.log('overview html snippet');
  console.log(await page.locator('body').innerHTML());
  await browser.close();
})();
