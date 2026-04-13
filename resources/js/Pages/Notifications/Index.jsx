import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ auth, notifications }) {
    /**
     * ฟังก์ชันสำหรับกด "อ่านแล้ว"
     */
    const markAsRead = (id) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true, // เพื่อไม่ให้หน้าเด้งตอนกดค่ะ
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">การแจ้งเตือนทั้งหมด 🔔</h2>}
        >
            <Head title="Notifications" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-4">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`p-4 rounded-lg border flex justify-between items-center transition ${
                                    notification.read_at ? 'bg-white opacity-60' : 'bg-indigo-50 border-indigo-200'
                                }`}
                            >
                                <div>
                                    <p className="text-sm text-gray-800">
                                        <span className="font-bold text-indigo-600">{notification.data.user_name}</span> 
                                        {' '}{notification.data.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>

                                {/* แสดงปุ่มอ่านแล้ว เฉพาะรายการที่ยังไม่ได้อ่าน */}
                                {!notification.read_at && (
                                    <button 
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                        ทำเป็นอ่านแล้ว
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-lg border text-gray-400">
                            ยังไม่มีการแจ้งเตือนในตอนนี้ค่ะ
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}