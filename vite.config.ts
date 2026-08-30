import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
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
    server: {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
    },
});
