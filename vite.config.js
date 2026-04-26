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
        hmr: { host: 'localhost' },
        watch: { usePolling: true },
        host: '0.0.0.0', 
        port: 5173,
    },
    build: {
        // ฃ
        // Vite 8 จะจัดการเลือกตัวบีบอัดที่เหมาะสมที่สุดให้เองโดยไม่ต้องลงเพิ่ม
        cssCodeSplit: true,
        chunkSizeWarningLimit: 800,
        
        rollupOptions: {
            output: {
                // ✅ รักษาฟังก์ชัน manualChunks ไว้เพื่อแก้เรื่อง TypeError รอบที่แล้ว
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'react-vendor';
                        if (id.includes('@inertiajs')) return 'inertia-vendor';
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
