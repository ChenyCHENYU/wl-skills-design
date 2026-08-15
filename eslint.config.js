"use strict";

const js = require("@eslint/js");

module.exports = [
  {
    ignores: ["node_modules/", "files/", "demo/", "kit-internal/", "spec-gen/"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
