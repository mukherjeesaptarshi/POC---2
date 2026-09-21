import { chromium, type Browser, type LaunchOptions } from '@playwright/test';

export class DriverFactory {
  static async createBrowser(options: LaunchOptions = {}): Promise<Browser> {
    return chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      ...options,
    });
  }
}