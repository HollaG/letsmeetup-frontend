/**
 * Jest config file.
 * 
 * Issue 1: Use jest.config.js instead of package.json
 * @see https://stackoverflow.com/a/68912023
 * 
 * Issue 2: DOMRect is not defined (because of drag-select library)
 * @see https://stackoverflow.com/a/71588871
 * 
 * Issue 3: Jest is not compiling date-fns and others
 * @see https://github.com/nrwl/nx/issues/812#issuecomment-799930598
 * 
 */
module.exports = {
    transformIgnorePatterns: [],
    transform: {
        "^.+.(ts|html)$": "ts-jest",
        "^.+.js$": "babel-jest",
    },
    testEnvironment: "./jest-env.ts",
    preset: "ts-jest",
};
