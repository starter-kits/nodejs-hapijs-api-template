module.exports = {
  verbose: true,
  displayName: "unit-tests",
  testEnvironment: "node",
  roots: ["src"],
  collectCoverageFrom: ["src/**/*.js"],
  coverageReporters: ["json", "lcov", "text", "cobertura"],
  coverageDirectory: "build/reports/test/coverage",
  reporters: ["default", "jest-junit"]
};
