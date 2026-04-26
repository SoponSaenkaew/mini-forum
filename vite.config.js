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
        //  [Performance] บีบอัดไฟล์ให้เล็กที่สุด
        minify: 'esbuild',
        cssCodeSplit: true, // แยกไฟล์ CSS ของแต่ละหน้าออกจากกัน
        chunkSizeWarningLimit: 500, // แจ้งเตือนถ้าไฟล์ไหนใหญ่เกิน 500kb
        
        rollupOptions: {
            output: {
                //  [Vendor Splitting]
                // แยก Library ที่ไม่ค่อยเปลี่ยน (React/Inertia) ออกจากโค้ดของโปรเจกต์
                // เพื่อให้เบราว์เซอร์ใช้ไฟล์ที่แคชไว้ใน .htaccess ได้ยาวๆ 1 ปีเต็ม
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'inertia-vendor': ['@inertiajs/react'],
                    // ถ้ามี Library อื่นๆ ที่ใหญ่ๆ เช่น axios หรือ framer-motion 
                    // สามารถเอามาใส่แยกเป็นอีก Chunk ได้ตรงนี้
                },
                
                // กำหนดรูปแบบชื่อไฟล์ให้คงที่เพื่อให้ระบบ Caching ทำงานได้แม่นยำ
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
    },
});
