const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleFileExtensions: ["ts", "js", "json"],
  //testMatch: ["**/tests/**/*.test.ts"], // look for test files in tests/ folder
  testMatch: ["**/*.test.ts"], // matches any *.test.ts file anywhere
  clearMocks: true,
};
