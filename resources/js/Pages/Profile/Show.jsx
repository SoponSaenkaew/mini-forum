import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PostItem from '@/Components/PostItem'; // ✨ เรียกใช้ตัวกลางที่สร้างไว้

export default function Show({ auth, user, posts }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">โปรไฟล์ของ {user.name} 👤</h2>}
        >
            <Head title={`Profile - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* ส่วนข้อมูลเจ้าของโปรไฟล์ */}
                    <div className="p-6 bg-white border-b border-gray-200 rounded-xl shadow-sm text-center">
                        <div className="h-20 w-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl text-white font-bold mb-4">
                            {user.name[0]}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500">เข้าร่วมเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}</p>
                    </div>

                    {/* รายการโพสต์ของ User คนนี้ */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-700 px-2">โพสต์ทั้งหมด ({posts.length})</h4>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostItem key={post.id} post={post} auth={auth} />
                            ))
                        ) : (
                            <div className="bg-white p-10 text-center rounded-xl border border-dashed border-gray-300 text-gray-400">
                                ยังไม่มีโพสต์เลยค่ะ 💦
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}