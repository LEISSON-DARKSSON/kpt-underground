import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 removed `next lint` and eslint-config-next now ships native flat
// configs; the old FlatCompat bridge crashed with a circular-structure error.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prototypes/**",
    // Generated design-preview bundle; not hand-written code.
    "src/lib/kiu-commerce-preview.mjs",
  ]),
]);

export default eslintConfig;
