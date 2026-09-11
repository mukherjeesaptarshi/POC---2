require("dotenv").config();

module.exports = {
  default: {
    paths: ["src/features/**/*.feature"],
    require: ["src/steps/**/*.ts", "src/support/**/*.ts"],
    requireModule: ["tsx/cjs"],
    format: ["progress", "html:reports/api-cucumber-report.html"],
    publishQuiet: true,
  },
};
