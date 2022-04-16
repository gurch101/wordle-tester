module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
      "no-magic-numbers": ["error", {"enforceConst": true, "ignore": [-1,0,1]}]
  },
  overrides: [{
    files: [ "*.test.ts" ],
    rules: {
      "no-magic-numbers": "off"
    },
  }],
};
