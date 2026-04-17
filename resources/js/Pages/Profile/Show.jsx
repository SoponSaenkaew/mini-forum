import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PostItem from '@/Components/PostItem'; 

/**
 * Profile Show Component
 * @description หน้าแสดงโปรไฟล์ผู้ใช้งานและรายการโพสต์ทั้งหมดของเจ้าของโปรไฟล์
 * @param {Object} props
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานที่ล็อกอินอยู่ปัจจุบัน
 * @param {Object} props.user - ข้อมูลเจ้าของโปรไฟล์ที่กำลังแสดงผล
 * @param {Array} props.posts - รายการโพสต์ทั้งหมดที่เขียนโดยเจ้าของโปรไฟล์
 * @returns {JSX.Element}
 */
export default function Show({ auth, user, posts }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">โปรไฟล์ของ {user.name} 👤</h2>}
        >
            <Head title={`Profile - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Section: ข้อมูลส่วนตัวเจ้าของโปรไฟล์ (User Profile Card) */}
                    <div className="p-6 bg-white border-b border-gray-200 rounded-xl shadow-sm text-center">
                        {/* Avatar วงกลมแบบกำหนดเองโดยใช้ตัวอักษรตัวแรกของชื่อ */}
                        <div className="h-20 w-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-md">
                            {user.name[0]}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500 mt-1">เข้าร่วมเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}</p>
                    </div>

                    {/* Section: รายการโพสต์ทั้งหมดของ User (User's Posts Feed) */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-700 px-2 text-lg border-l-4 border-indigo-500 pl-3">
                            โพสต์ทั้งหมด ({posts.length})
                        </h4>
                        
                        {/* ตรวจสอบว่ามีโพสต์หรือไม่ ถ้ามีให้ render PostItem, ถ้าไม่มีแสดงข้อความว่างเปล่า */}
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostItem key={post.id} post={post} auth={auth} />
                            ))
                        ) : (
                            <div className="bg-white p-10 text-center rounded-xl border border-dashed border-gray-300 text-gray-400">
                                ยังไม่มีโพสต์เลยค่ะ 💦 ลองสร้างโพสต์แรกดูไหมคะ?
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}