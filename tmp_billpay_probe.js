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
  await page.getByRole('link', { name: /bill pay/i }).click();
  await page.waitForTimeout(1500);

  const fillValid = async () => {
    await page.locator('input[name="payee.name"]').fill('ACME Utilities');
    await page.locator('input[name="payee.address.street"]').fill('10 Market St');
    await page.locator('input[name="payee.address.city"]').fill('Sydney');
    await page.locator('input[name="payee.address.state"]').fill('NSW');
    await page.locator('input[name="payee.address.zipCode"]').fill('2000');
    await page.locator('input[name="payee.phoneNumber"]').fill('0400123456');
    await page.locator('input[name="payee.accountNumber"]').fill('123456');
    await page.locator('input[name="verifyAccount"]').fill('123456');
    await page.locator('input[name="amount"]').fill('25.00');
  };

  await fillValid();
  await page.locator('input[value="Send Payment"]').click();
  await page.waitForTimeout(2000);
  console.log('--- after valid ---');
  console.log(await page.locator('body').innerText());

  await page.getByRole('link', { name: /bill pay/i }).click();
  await page.waitForTimeout(1500);
  await fillValid();
  await page.locator('input[name="payee.name"]').fill('');
  await page.locator('input[value="Send Payment"]').click();
  await page.waitForTimeout(2000);
  console.log('--- after blank payee name ---');
  console.log(await page.locator('body').innerText());

  await browser.close();
})();
