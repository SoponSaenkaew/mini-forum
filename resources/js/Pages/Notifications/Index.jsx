import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

/**
 * @component NotificationsIndex
 * @description หน้าแสดงรายการแจ้งเตือน (Notifications) ทั้งหมดของผู้ใช้งาน
 * รองรับการจัดการสถานะการอ่าน (Mark as Read) และการลบประวัติการแจ้งเตือน
 * ปรับปรุงโครงสร้าง Semantic HTML และพื้นที่สัมผัส (Touch Targets) ตามมาตรฐาน Lighthouse
 *
 * @param {Object} props - ข้อมูล Props ที่ได้รับมาจากเซิร์ฟเวอร์ (Inertia)
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบันที่กำลังเข้าสู่ระบบ
 * @param {Array} props.notifications - รายการข้อมูลการแจ้งเตือนทั้งหมดของผู้ใช้งาน
 */
export default function Index({ auth, notifications }) {
    
    // ==========================================
    // ฟังก์ชันจัดการเหตุการณ์ (Event Handlers)
    // ==========================================

    /**
     * @function markAllAsRead
     * @description ส่งคำร้องขอไปยังเซิร์ฟเวอร์เพื่ออัปเดตสถานะการแจ้งเตือนทั้งหมดให้เป็น "อ่านแล้ว"
     */
    const markAllAsRead = () => {
        if (window.confirm('คุณต้องการทำเครื่องหมายว่าอ่านแล้วทั้งหมดใช่หรือไม่?')) {
            router.post(route('notifications.read_all'), {}, { 
                preserveScroll: true 
            });
        }
    };

    /**
     * @function deleteNotification
     * @description ส่งคำร้องขอไปยังเซิร์ฟเวอร์เพื่อลบข้อมูลการแจ้งเตือนแบบรายรายการ
     * @param {number|string} id - รหัส (ID) ของการแจ้งเตือนเป้าหมาย
     */
    const deleteNotification = (id) => {
        if (window.confirm('คุณยืนยันที่จะลบประวัติการแจ้งเตือนนี้ใช่หรือไม่?')) {
            router.delete(route('notifications.destroy', id), { 
                preserveScroll: true 
            });
        }
    };

    /**
     * @function markAsRead
     * @description ส่งคำร้องขอไปยังเซิร์ฟเวอร์เพื่ออัปเดตสถานะการแจ้งเตือนรายการนี้ให้เป็น "อ่านแล้ว"
     * @param {number|string} id - รหัส (ID) ของการแจ้งเตือนเป้าหมาย
     */
    const markAsRead = (id) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
        });
    };

    // ==========================================
    // การแสดงผล (Render)
    // ==========================================

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        การแจ้งเตือนทั้งหมด 🔔
                    </h2>
                    {/* แสดงปุ่ม "ทำเป็นอ่านแล้วทั้งหมด" เฉพาะกรณีที่มีการแจ้งเตือนที่ยังไม่ได้อ่านเท่านั้น */}
                    {auth.user.unread_notifications_count > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            aria-label="ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว" 
                            className="text-xs font-bold bg-white border border-indigo-200 text-indigo-600 px-4 py-2 min-h-[44px] rounded-lg hover:bg-indigo-50 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            ทำเป็นอ่านแล้วทั้งหมด ✅
                        </button>
                    )}
                </div>
            }
        >
            
            <Head>
                <title>การแจ้งเตือนทั้งหมด - Tuna Forum</title>
                <meta name="description" content="ดูรายการแจ้งเตือนและกิจกรรมล่าสุดของคุณบนระบบ Tuna Forum" />
            </Head>

            <main className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    
                    {/* ตรวจสอบว่ามีข้อมูลการแจ้งเตือนหรือไม่ */}
                    {notifications && notifications.length > 0 ? (
                        <ul className="space-y-4" aria-label="รายการการแจ้งเตือน">
                            {notifications.map((notification) => (
                                <li 
                                    key={notification.id} 
                                    className={`group p-4 rounded-xl border flex flex-col sm:flex-row sm:justify-between sm:items-center transition shadow-sm gap-3 sm:gap-0 ${
                                        notification.read_at ? 'bg-white opacity-75' : 'bg-indigo-50 border-indigo-200'
                                    }`}
                                >
                                    <div className="flex-1 sm:mr-4">
                                        <Link 
                                            method="patch" 
                                            as="button" 
                                            href={route('notifications.read', notification.id)} 
                                            className="text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1 -m-1"
                                        >
                                            {/* 🌟 [Semantic HTML] ใช้ span แทน p ภายใน button เพื่อความถูกต้องของโครงสร้าง HTML */}
                                            <span className="block text-sm text-gray-800 group-hover:text-indigo-600 transition leading-relaxed">
                                                <span className="font-bold text-indigo-600">{notification.data.user_name}</span> 
                                                {' '}{notification.data.message}
                                            </span>
                                        </Link>
                                        
                                        <time dateTime={notification.created_at} className="block text-[11px] font-medium text-gray-500 mt-2">
                                            {new Date(notification.created_at).toLocaleString('th-TH')}
                                        </time>
                                    </div>

                                    {/* แถบเครื่องมือจัดการการแจ้งเตือน */}
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        
                                        {/* ปุ่มเปลี่ยนสถานะเป็น "อ่านแล้ว" (แสดงเฉพาะรายการที่ยังไม่ได้อ่าน) */}
                                        {!notification.read_at && (
                                            <button 
                                                onClick={() => markAsRead(notification.id)}
                                                aria-label="ทำเครื่องหมายว่าอ่านแล้ว" 
                                                // 🌟 [Lighthouse A11y] ขยาย Touch Target ด้วย min-h-[44px]
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100/80 px-4 py-2 min-h-[44px] flex items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                อ่านแล้ว
                                            </button>
                                        )}

                                        {/* ปุ่มลบประวัติการแจ้งเตือน */}
                                        <button 
                                            onClick={() => deleteNotification(notification.id)}
                                            aria-label={`ลบการแจ้งเตือนจาก ${notification.data.user_name}`} 
                                            // 🌟 [Lighthouse A11y] ขยาย Touch Target ด้วย min-h-[44px] min-w-[44px]
                                            className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-lg"
                                            title="ลบแจ้งเตือนนี้"
                                        >
                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        /* หน้าจอแสดงผลเมื่อไม่มีการแจ้งเตือน (Empty State) */
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-lg font-medium text-gray-600">ไม่มีการแจ้งเตือนใหม่</p>
                            <p className="text-sm text-gray-400 mt-1">คุณติดตามข่าวสารได้ครบถ้วนแล้วค่ะ</p>
                        </div>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
