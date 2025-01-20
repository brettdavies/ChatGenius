module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json"
      }
    }
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  env: {
    node: true,
    es2022: true
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "custom-rules/api-response-format": ["error", {
      responseProperties: ["message", "code"],
      errorProperties: ["message", "code", "path"],
    }],
  },
  overrides: [
    {
      files: ["src/routes/**/*.ts"],
      rules: {
        "custom-rules/api-response-format": ["error", {
          responseProperties: ["message", "code"],
          errorProperties: ["message", "code", "path"],
        }],
      },
    },
  ],
} 