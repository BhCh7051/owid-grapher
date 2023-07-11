module.exports = {
    extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        project: "./tsconfig.eslint.json",
        ecmaVersion: 2018,
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
        },
    ],
    rules: {
        // use `export type` whenever applicable
        "@typescript-eslint/consistent-type-exports": [
            "warn",
            { fixMixedExportsWithInlineTypeSpecifier: true },
        ],
        // These rules are only preliminary to ease the migration from tslint, many of them might make sense to have enabled!
        "@typescript-eslint/explicit-function-return-type": "off", // This rule is enabled on a folder by folder basis and should be enabled project wide soon
        "@typescript-eslint/explicit-module-boundary-types": "off", // This rule is enabled on a folder by folder basis and should be enabled project wide soon
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/no-explicit-any": "off", // TODO: enable this rule
        "@typescript-eslint/no-for-in-array": "warn",
        "@typescript-eslint/no-inferrable-types": "off", // If this is on the ESLint automatic fixing removes type annotations in assignments like "somenumber: number = 4"
        "@typescript-eslint/no-namespace": "warn",
        "@typescript-eslint/no-non-null-assertion": "off", // TODO: enable this rule
        "@typescript-eslint/no-this-alias": "warn",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-use-before-define": "off", // This was useful in the past with var and variable hoisting changing depending on scope but AFAIK typescript deals with this in a sane way and we can leave this off
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/restrict-plus-operands": "warn",
        "import/no-named-as-default-member": "off", // probably makes sense to enable this at some point
        "import/namespace": "off",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "no-var": "warn",
        "prefer-const": ["warn", { destructuring: "all" }],
        "react/display-name": "warn",
        "react/jsx-key": "warn",
        "react/jsx-no-target-blank": ["warn", { allowReferrer: true }],
        "react/no-render-return-value": "warn",
        "react/no-unescaped-entities": "off", // This rule is overly noisy in JSX blocks when quotes are used for little gain
        "react/prop-types": "warn",
    },
    settings: {
        "import/resolver": {
            typescript: true,
            node: true,
        },
        react: {
            version: "detect",
        },
    },
}
