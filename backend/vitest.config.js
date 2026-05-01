import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        threads: false,
        isolate: true,
        fileParallelism: false,
        setupFiles: ['src/tests/setup.js'],
        environment: 'node',
        env: {
            NODE_ENV: "test"
        },
        globals: true,
        testTimeout: 10000,
        hookTimeout: 20000,
        coverage: {
            provider: 'v8',
            reportsDirectory: './coverage',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.js'],
            exclude: [
                'src/index.js',
                'src/config/**',
                'src/**/*.test.js',
                'src/tests/**',
                'src/migrations/**',
                'src/models/**',
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 75,
                statements: 80
            }
        },
    }
})