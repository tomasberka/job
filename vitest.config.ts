import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        exclude: ["node_modules", "background-removal-js-main", "scripts"],
        globals: true,
    },
});
