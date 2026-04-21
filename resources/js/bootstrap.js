import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ✨ เปิดใช้งาน Echo และเชื่อมต่อกับ Reverb
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher', // เปลี่ยนจาก 'reverb' เป็น 'pusher' 
    key: import.meta.env.VITE_PUSHER_APP_KEY, // ใช้ Key ของ Pusher
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, // เพิ่ม Cluster เข้าไป (ap1)
    forceTLS: true, // สำหรับ Pusher แนะนำให้เปิดเป็น true เพื่อความปลอดภัยค่ะ
    enabledTransports: ['ws', 'wss'],
});