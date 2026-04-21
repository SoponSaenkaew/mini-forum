import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * กำหนดค่า Broadcaster ตาม Environment Variable
 * หากไม่ได้ระบุไว้ จะใช้ 'reverb' เป็นค่าเริ่มต้นสำหรับการพัฒนาใน Local
 */
const broadcaster = import.meta.env.VITE_BROADCAST_CONNECTION || 'reverb';

if (broadcaster === 'pusher') {
    /**
     * การตั้งค่าสำหรับ Production Environment (Pusher)
     * ใช้เมื่อ Deploy ขึ้นระบบจริง เช่น Render หรือเซิร์ฟเวอร์อื่นๆ
     * จำเป็นต้องกำหนดค่า VITE_PUSHER_APP_KEY และ VITE_PUSHER_APP_CLUSTER ใน .env
     */
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true // บังคับใช้ TLS (WSS) เพื่อความปลอดภัยบน Production
    });
} else {
    /**
     * การตั้งค่าสำหรับ Local Development (Laravel Reverb)
     * ใช้สำหรับทดสอบในเครื่อง โดยไม่ต้องพึ่งพาบริการภายนอก
     */
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: import.meta.env.VITE_REVERB_PORT || 8081,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 8081,
        forceTLS: false, // ปิด TLS สำหรับ Local เพื่อป้องกันปัญหา SSL Certificate
        enabledTransports: ['ws'],
        withCredentials: true,
    });
}