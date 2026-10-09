import { chromium, firefox, type Browser, type LaunchOptions } from '@playwright/test';

export class DriverFactory {
  static async createBrowser(options: LaunchOptions = {}): Promise<Browser> {
    const launchOptions = {
      headless: process.env.HEADLESS !== 'false',
      ...options,
    };

    switch (process.env.WEB_BROWSER?.toLowerCase() ?? 'chromium') {
      case 'chromium':
        return chromium.launch(launchOptions);
      case 'chrome':
        return chromium.launch({ channel: 'chrome', ...launchOptions });
      case 'edge':
        return chromium.launch({ channel: 'msedge', ...launchOptions });
      case 'firefox':
        return firefox.launch(launchOptions);
      default:
        throw new Error(`Unsupported WEB_BROWSER: ${process.env.WEB_BROWSER}`);
    }
  }
}