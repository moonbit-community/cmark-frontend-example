import eslint from "@eslint/js";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  { ignores: ["dist/*", "**/__snapshots__/*"] },
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  eslintPluginPrettierRecommended,
];
