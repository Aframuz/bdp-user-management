import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@Assets': fileURLToPath(new URL('./resources/assets', import.meta.url)),
            '@Components': fileURLToPath(new URL('./resources/js/Components', import.meta.url)),
            '@Hooks': fileURLToPath(new URL('./resources/js/Hooks', import.meta.url)),
            '@Layouts': fileURLToPath(new URL('./resources/js/Layouts', import.meta.url)),
            '@Pages': fileURLToPath(new URL('./resources/js/Pages', import.meta.url)),
            '@Services': fileURLToPath(new URL('./resources/js/Services', import.meta.url)),
            '@Types': fileURLToPath(new URL('./resources/js/Types', import.meta.url)),
            '@Utils': fileURLToPath(new URL('./resources/js/Utils', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/frontend/setup.ts'],
        include: ['tests/frontend/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['resources/js/**/*.{ts,tsx}'],
        },
    },
});
