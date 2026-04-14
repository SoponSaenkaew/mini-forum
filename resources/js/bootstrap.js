import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ✨ เปิดใช้งาน Echo และเชื่อมต่อกับ Reverb
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8081,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8081,
    forceTLS: false, // ✨ ปิดการบังคับใช้ TLS เพราะเราจะใช้ ws/wss ตามที่กำหนด
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'], // ✨ เปิดใช้งานเฉพาะ WebSocket เท่านั้น
    // enabledTransports: ['ws', 'wss'],
});