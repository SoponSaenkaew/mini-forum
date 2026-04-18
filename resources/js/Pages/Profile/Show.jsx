import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PostItem from '@/Components/PostItem'; 

/**
 * @component ProfileShow
 * @description หน้าแสดงโปรไฟล์ผู้ใช้ (Public Profile) 
 * แสดงข้อมูลพื้นฐานของผู้ใช้และรายการโพสต์ทั้งหมดที่ผู้ใช้คนนี้เคยสร้าง
 * * @param {Object} props
 * @param {Object} props.auth - ข้อมูลการเข้าสู่ระบบของผู้ใช้ปัจจุบัน
 * @param {Object} props.user - ข้อมูลเจ้าของโปรไฟล์ที่กำลังแสดงผล
 * @param {Array}  props.posts - รายการโพสต์ทั้งหมดของเจ้าของโปรไฟล์นี้
 */
export default function Show({ auth, user, posts }) {
    
    /** * ตรวจสอบว่าผู้ใช้ที่กำลังล็อกอินอยู่ คือเจ้าของโปรไฟล์นี้หรือไม่
     * เพื่อใช้ในการตัดสินใจแสดงปุ่ม "แก้ไขโปรไฟล์"
     */
    const isOwnProfile = auth.user.id === user.id;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {isOwnProfile ? 'โปรไฟล์ของฉัน' : `โปรไฟล์ของ ${user.name}`} ✨
                </h2>
            }
        >
            {/* กำหนด Meta Title สำหรับ Browser Tab */}
            <Head title={`Profile - ${user.name}`} />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- ส่วนหัวโปรไฟล์ (User Header Card) --- */}
                    <section className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex flex-col items-center sm:flex-row gap-6 text-center sm:text-left">
                            {/* Avatar: แสดงอักษรตัวแรกของชื่อ */}
                            <div className="h-32 w-32 relative shrink-0">
                                {user.avatar ? (
                                    <img 
                                        src={`/storage/${user.avatar}`} 
                                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                                        alt={user.name}
                                    />
                                ) : (
                                    <div className="h-32 w-32 bg-indigo-500 rounded-full flex items-center justify-center text-4xl text-white font-black shadow-lg">
                                        {user.name[0]}
                                    </div>
                                )}
                            </div>
                            
                            {/* ข้อมูลพื้นฐาน: ชื่อ, อีเมล และวันที่เข้าร่วม */}
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900">{user.name}</h3>
                                <p className="text-gray-500">{user.email}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    เป็นสมาชิกเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}
                                </p>
                            </div>
                        </div>

                        {/* การควบคุม (Actions): ปุ่มแก้ไขโปรไฟล์จะแสดงเฉพาะเมื่อเป็นเจ้าของโปรไฟล์เท่านั้น */}
                        {isOwnProfile && (
                            <Link
                                href={route('profile.edit')}
                                className="mt-6 sm:mt-0 px-6 py-2 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                แก้ไขโปรไฟล์ ⚙️
                            </Link>
                        )}
                    </section>

                    {/* --- ส่วนรายการโพสต์ (User Activity Feed) --- */}
                    <div className="space-y-6">
                        <header className="flex items-center justify-between px-2">
                            <h4 className="font-bold text-gray-700 text-lg border-l-4 border-indigo-500 pl-3">
                                โพสต์ล่าสุด
                            </h4>
                            <span className="text-sm text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                                {posts.length} โพสต์
                            </span>
                        </header>
                        
                        {/* รายการฟีด: วนลูปแสดง PostItem ถ้ามีข้อมูล 
                            หากไม่มีข้อมูลจะแสดงสถานะ Empty State
                        */}
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostItem key={post.id} post={post} auth={auth} />
                            ))
                        ) : (
                            <div className="bg-white p-16 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                                <p className="text-lg italic">ยังไม่มีเรื่องราวที่โพสต์เลยค่ะ... 💦</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}