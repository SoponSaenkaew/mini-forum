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
                    {/* ✨ โซนหน้าปก + โปรไฟล์ (รวมไว้ในการ์ดเดียวกันเพื่อความสวยงาม) */}
                    <section className="bg-white shadow-sm sm:rounded-3xl overflow-hidden border border-gray-100">
                        
                        {/* 1. ส่วนรูปหน้าปก (Cover Photo) */}
                        <div className="h-48 sm:h-64 w-full relative">
                            {user.cover_photo ? (
                                <img 
                                    src={`/storage/${user.cover_photo}`} 
                                    className="w-full h-full object-cover" 
                                    alt="Cover" 
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
                            )}
                        </div>

                        {/* 2. ส่วนข้อมูลผู้ใช้และรูปโปรไฟล์ (ดึงรูปขึ้นไปทับหน้าปกด้วย -mt-16) */}
                        <div className="px-6 sm:px-10 pb-8 relative">
                            <div className="flex flex-col sm:flex-row gap-6">
                                
                                {/* รูปโปรไฟล์: ขยับขึ้นไปทับหน้าปก */}
                                <div className="relative shrink-0 -mt-16 sm:-mt-20">
                                    {user.avatar ? (
                                        <img 
                                            src={`/storage/${user.avatar}`} 
                                            className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-4 border-white shadow-md bg-white"
                                            alt={user.name}
                                        />
                                    ) : (
                                        <div className="h-32 w-32 sm:h-40 sm:w-40 bg-indigo-500 rounded-full flex items-center justify-center text-4xl text-white font-black shadow-md border-4 border-white">
                                            {user.name[0]}
                                        </div>
                                    )}
                                </div>

                                {/* ข้อมูลชื่อและอีเมล */}
                                <div className="flex-1 mt-2 sm:mt-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                                            <p className="text-gray-500 font-medium">
                                                {user.email} <span className="mx-2 text-gray-300">•</span> เข้าร่วมเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>

                                        {/* ปุ่มแก้ไขโปรไฟล์ */}
                                        {isOwnProfile && (
                                            <Link 
                                                href={route('profile.edit')} 
                                                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold transition-all text-sm shrink-0"
                                            >
                                                ⚙️ ตั้งค่าโปรไฟล์
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
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