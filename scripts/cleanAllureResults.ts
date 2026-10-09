import { rmSync } from "node:fs";
import { resolve } from "node:path";

const resultsDirectory = resolve(process.cwd(), "allure-results");

rmSync(resultsDirectory, { recursive: true, force: true });
console.log(`Cleared Allure results: ${resultsDirectory}`);