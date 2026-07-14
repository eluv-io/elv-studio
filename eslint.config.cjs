const globals = require("globals");
const {
    fixupConfigRules,
} = require("@eslint/compat");

const babelParser = require("@babel/eslint-parser");
const reactRefresh = require("eslint-plugin-react-refresh");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [
    {
        ignores: ["**/dist", "**/.eslintrc.cjs"],
    },
    ...fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
    )),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parser: babelParser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                requireConfigFile: false,
                ecmaFeatures: {
                    experimentalObjectRestSpread: true,
                },
                babelOptions: {
                    presets: ["@babel/preset-react"],
                },
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        plugins: {
            "react-refresh": reactRefresh,
        },
        rules: {
            "react-hooks/exhaustive-deps": 0,
            "react/prop-types": 0,
            "semi": ["error", "always"],
            "react-refresh/only-export-components": ["warn", {
                allowConstantExport: true,
            }],
            "no-console": ["error"],
            "quotes": ["error", "double"],
        },
    },
];
