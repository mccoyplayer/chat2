module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        // "plugin:react/recommended",
    ],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "react"],
    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/ban-types": "warn",
        "@typescript-eslint/no-extra-semi": "warn",
        "no-case-declarations": "warn",
        "prefer-const": "warn",
        "no-useless-escape": "warn",
        "no-misleading-character-class": "warn",
        "no-var": "warn",
        "no-unsafe-optional-chaining": "warn",
        "no-empty": "warn",
        "no-dupe-else-if": "warn",
        "no-prototype-builtins": "warn",
        "react/react-in-jsx-scope": "off",
    },
};
