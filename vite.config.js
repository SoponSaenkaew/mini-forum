import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
    ],

    server: {
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
        host: '0.0.0.0', 
        port: 5173,
    },

    build: {
        // 🌟 [Performance] แก้ปัญหา Warning เรื่อง esbuild
        minify: 'terser', // ใช้ terser แทนเพื่อให้บีบอัดโค้ดได้เล็กลงอีกนิด
        cssCodeSplit: true,
        
        rollupOptions: {
            output: {
                // 🌟 [The Fix] เปลี่ยนจาก Object เป็น Function เพื่อแก้ TypeError
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // แยก React และ Inertia ออกมาเป็นก้อนใหญ่
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('@inertiajs')) {
                            return 'inertia-vendor';
                        }
                        // ที่เหลือรวมเป็น vendor
                        return 'vendor';
                    }
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
    },
});
