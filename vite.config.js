import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],

    server: { // ✨ เพิ่มส่วนนี้เข้าไปค่ะ
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
        host: '0.0.0.0', // ✨ บังคับให้ Vite ฟังทุกสัญญาณ
        port: 5173,
    },
});
