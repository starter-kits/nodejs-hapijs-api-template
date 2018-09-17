"use strict";
/* eslint-disable no-console */

const { CLIEngine } = require("eslint");
const fs = require("fs");
const path = require("path");

const eslintJunitReportPath = path.resolve(__dirname, "../build/reports/lint/eslint.xml");

const ignorePattern = ["**/node_modules/**", "**/coverage", "build"];
const includeFiles = ["."];
const formatOptionList = ["checkstyle", "codeframe"];

const cli = new CLIEngine({
  ignorePattern
});

const report = cli.executeOnFiles(includeFiles);

formatOptionList.filter(format => "checkstyle" === format).map(format => {
  const formatter = cli.getFormatter(format);
  fs.writeFileSync(eslintJunitReportPath, formatter(report.results), {
    encoding: "utf8"
  });
});

formatOptionList.filter(format => "checkstyle" !== format).map(format => {
  const formatter = cli.getFormatter(format);
  console.log(formatter(report.results));
});

if (0 < report.errorCount) {
  console.log("Linting FAILED");
  process.exit(1);
} else {
  console.log("Linting SUCCESS");
}
