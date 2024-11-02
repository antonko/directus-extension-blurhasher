const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: typescriptParser,
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "off",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".ts"],
        },
      },
    },
  },
  {
    ignores: ["dist/*"],
  },
  {
    files: ["*.ts", "*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
  {
    files: [".eslintrc.js", "eslint.config.js"],
    languageOptions: {
      sourceType: "script",
    },
  },
];
