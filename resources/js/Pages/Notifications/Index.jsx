import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

/**
 * @page Notifications Index
 * @description หน้าแสดงรายการแจ้งเตือนทั้งหมด พร้อมฟีเจอร์อ่านทั้งหมดและลบทีละรายการ
 */
export default function Index({ auth, notifications }) {
    
    // ✨ ฟังก์ชันทำเป็นอ่านแล้วทั้งหมด
    const markAllAsRead = () => {
        if (confirm('จะทำเป็นอ่านแล้วทั้งหมดเลยเหรอคะเซนเซ? ✨')) {
            router.post(route('notifications.read_all'), {}, { 
                preserveScroll: true 
            });
        }
    };

    // ✨ ฟังก์ชันลบการแจ้งเตือนทีละอัน
    const deleteNotification = (id) => {
        if (confirm('จะลบประวัตินี้ทิ้งจริงๆ เหรอคะ? 🥺')) {
            router.delete(route('notifications.destroy', id), { 
                preserveScroll: true 
            });
        }
    };

    const markAsRead = (id) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        การแจ้งเตือนทั้งหมด 🔔
                    </h2>
                    {/* ✨ ปุ่มอ่านทั้งหมด จะแสดงเมื่อมีรายการที่ยังไม่ได้อ่านเท่านั้น */}
                    {auth.user.unread_notifications_count > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-xs font-bold bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition shadow-sm"
                        >
                            ทำเป็นอ่านแล้วทั้งหมด ✅
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Notifications" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-4">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`group p-4 rounded-xl border flex justify-between items-center transition shadow-sm ${
                                    notification.read_at ? 'bg-white opacity-70' : 'bg-indigo-50 border-indigo-200'
                                }`}
                            >
                                <div className="flex-1 mr-4">
                                    <Link 
                                        method="patch" 
                                        as="button" 
                                        href={route('notifications.read', notification.id)} 
                                        className="text-left w-full"
                                    >
                                        <p className="text-sm text-gray-800 group-hover:text-indigo-600 transition">
                                            <span className="font-bold text-indigo-600">{notification.data.user_name}</span> 
                                            {' '}{notification.data.message}
                                        </p>
                                    </Link>
                                    
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(notification.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* ปุ่มอ่านแล้ว (แสดงเฉพาะที่ยังไม่อ่าน) */}
                                    {!notification.read_at && (
                                        <button 
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 px-2 py-1 rounded-md transition"
                                        >
                                            อ่านแล้ว
                                        </button>
                                    )}

                                    {/* ✨ ปุ่มลบประวัติ (ถังขยะ) จะชัดขึ้นเมื่อเอาเมาส์มาวาง (Hover) */}
                                    <button 
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-gray-300 hover:text-rose-500 transition p-1"
                                        title="ลบแจ้งเตือนนี้"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                            ยังไม่มีการแจ้งเตือนในตอนนี้ค่ะ 🎈
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}