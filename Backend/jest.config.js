export default {
  testEnvironment: "node",
  roots: ["<rootDir>/../tests/whitebox/backend"],
  testMatch: ["**/*.test.js"],
  clearMocks: true,
  transform: {},
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  collectCoverageFrom: [
    "<rootDir>/src/controllers/**/*.js",
    "<rootDir>/src/routes/**/*.js",
    "<rootDir>/src/models/**/*.js",
  ],
  coverageDirectory: "<rootDir>/../reports/raw/backend-coverage",
};
