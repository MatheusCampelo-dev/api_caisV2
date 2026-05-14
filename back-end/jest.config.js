module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  forceExit: true,
  clearMocks: true,
};
