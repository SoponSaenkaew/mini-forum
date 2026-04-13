import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react'; // ✨ เพิ่ม Link เข้ามาเพื่อใช้ในการวาร์ปค่ะ

/**
 * @page Notifications Index
 * @description หน้าแสดงรายการแจ้งเตือนทั้งหมด และจัดการสถานะการอ่าน
 */
export default function Index({ auth, notifications }) {
    /**
     * เปลี่ยนสถานะการแจ้งเตือนเป็น "อ่านแล้ว"
     * @param {string} id - ไอดีของการแจ้งเตือน
     */
    const markAsRead = (id) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true, // ป้องกันหน้าเด้งกลับไปด้านบนตอนกดค่ะ
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">การแจ้งเตือนทั้งหมด 🔔</h2>}
        >
            <Head title="Notifications" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-4">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`p-4 rounded-xl border flex justify-between items-center transition shadow-sm ${
                                    notification.read_at ? 'bg-white opacity-60' : 'bg-indigo-50 border-indigo-200'
                                }`}
                            >
                                <div className="flex-1 mr-4">
                                    {/* ✨ ส่วนที่เพิ่ม: หุ้มข้อความแจ้งเตือนด้วย Link เพื่อให้กดวาร์ปไปที่โพสต์ได้ */}
                                    <Link 
                                        method="patch" 
                                        as="button" 
                                        href={route('notifications.read', notification.id)} 
                                        className="..."
                                    >
                                        <p className="text-sm text-gray-800 group-hover:text-indigo-600 transition">
                                            <span className="font-bold text-indigo-600">{notification.data.user_name}</span> 
                                            {' '}{notification.data.message}
                                        </p>
                                    </Link>
                                    
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>

                                {/* แสดงปุ่มสำหรับแจ้งเตือนที่ยังไม่ได้อ่าน */}
                                {!notification.read_at && (
                                    <button 
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full transition"
                                    >
                                        ทำเป็นอ่านแล้ว
                                    </button>
                                )}
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