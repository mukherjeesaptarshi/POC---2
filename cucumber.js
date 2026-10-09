require("dotenv").config();

const webReportSuffix = process.env.WEB_BROWSER
  ? `-${process.env.WEB_BROWSER.toLowerCase()}`
  : "";
const reportRunId = (
  process.env.REPORT_RUN_ID || `${Date.now()}-${process.pid}`
).replace(/[^a-zA-Z0-9_-]/g, "-");

module.exports = {
  default: {
    paths: ["src/features/**/*.feature"],
    tags: "@api",
    require: ["src/steps/**/*.ts", "src/support/**/*.ts"],
    requireModule: ["tsx/cjs"],
    format: [
      "html:reports/api-cucumber-report.html",
      ["allure-cucumberjs/reporter", "allure-results/cucumber-reporter.log"],
      `json:reports/api-cucumber-${reportRunId}.json`,
      "progress",
    ],
    publishQuiet: true,
  },
  web: {
    paths: ["src/features/web/**/*.feature"],
    require: ["src/steps/**/*.ts", "src/support/**/*.ts"],
    requireModule: ["tsx/cjs"],
    format: [
      `html:reports/web-cucumber-report${webReportSuffix}.html`,
      ["allure-cucumberjs/reporter", "allure-results/cucumber-reporter.log"],
      `json:reports/web-cucumber-report${webReportSuffix}.json`,
      `json:reports/web-cucumber-${process.env.WEB_BROWSER || "chromium"}-${reportRunId}.json`,
      "progress",
    ],
    publishQuiet: true,
  },
};
