module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  verbose: true,
  collectCoverage: true,
  clearMocks: true,
};
