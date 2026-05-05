import { defineConfig } from 'vite';

export default defineConfig({
    base: '/donjon-des-nombres/',
    build: {
        outDir: 'dist',
        assetsInlineLimit: 0
    },
    server: {
        port: 3000
    }
});
