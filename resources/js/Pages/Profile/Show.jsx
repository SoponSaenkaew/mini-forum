import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react'; // ✨ แก้ไขจุดนี้ (เพิ่ม Link)

/**
 * @page Profile Show
 * @description หน้าแสดงข้อมูลโปรไฟล์และรายการโพสต์ทั้งหมดของผู้ใช้คนนั้นๆ
 */
export default function Show({ auth, user, posts }) {
    return (
        <AuthenticatedLayout 
            header={<h2 className="text-xl font-semibold text-gray-800">โปรไฟล์ของ {user.name} 👤</h2>}
        >
            <Head title={`Profile - ${user.name}`} />
            
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- ส่วนข้อมูลผู้ใช้ (User Card) --- */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="h-24 w-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-4xl text-indigo-700 font-bold mb-4 shadow-inner">
                            {user.name[0]}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                        
                        {/* ป้ายกำกับถ้าเป็น Admin */}
                        {user.is_admin && (
                            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                🛡️ System Admin
                            </span>
                        )}
                        
                        <div className="mt-6 pt-6 border-t border-gray-50 text-sm text-gray-400">
                            เป็นสมาชิกตั้งแต่: {new Date(user.created_at).toLocaleDateString('th-TH', { 
                                year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                        </div>
                    </div>

                    <h4 className="font-bold text-lg text-gray-700 px-2">โพสต์ทั้งหมด ({posts.length})</h4>

                    {/* --- รายการโพสต์ (Post Feed) --- */}
                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition">
                                    <h5 className="font-bold text-xl text-gray-900">{post.title}</h5>
                                    <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">{post.content}</p>
                                    
                                    <div className="mt-4 flex justify-between items-center border-t pt-4">
                                        <span className="text-xs text-gray-400">
                                            {new Date(post.created_at).toLocaleString('th-TH')}
                                        </span>
                                        {/* ✨ ตอนนี้ Link จะทำงานได้ปกติแล้วค่ะ! */}
                                        <Link 
                                            href={route('posts.show', post.id)} 
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                        >
                                            ดูรายละเอียดโพสต์ →
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                                ผู้ใช้คนนี้ยังไม่มีการโพสต์เรื่องราวใดๆ ค่ะ
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center mt-6">
                        <Link href={route('dashboard')} className="text-sm text-gray-500 hover:text-indigo-600">
                            ← กลับไปที่หน้า Feed หลัก
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}