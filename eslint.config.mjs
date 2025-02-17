import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: { import: importPlugin },
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "external",
            "builtin",
            "internal",
            "sibling",
            "parent",
            "index",
          ],
          pathGroups: [
            { pattern: "components", group: "internal" },
            { pattern: "common", group: "internal" },
            { pattern: "routes/**", group: "internal" },
            { pattern: "assets/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["internal"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
    },
  },
];

export default eslintConfig;
