import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Dashboard from '@/Pages/Dashboard'; // ✨ เราสามารถ Reuse Component หรือก๊อป UI มาได้ค่ะ

export default function Show({ auth, post }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">กระทู้ของ {post.user.name}</h2>}>
            <Head title={`Post: ${post.title}`} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* แสดงเฉพาะโพสต์ที่ส่งมา (เซนเซสามารถก๊อป UI Card จาก Dashboard มาวางได้เลยค่ะ) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="mb-4">
                            <Link href={route('profile.show', post.user.id)} className="font-bold text-indigo-600 hover:underline">
                                {post.user.name}
                            </Link>
                            <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('th-TH')}</div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{post.title}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap mb-6">{post.content}</p>
                        
                        {post.image && (
                            <img src={`/storage/${post.image}`} className="w-full rounded-lg mb-6" />
                        )}

                        {/* ส่วนคอมเมนต์ (Reuse ส่วนเดิมจาก Dashboard ได้เลยค่ะ) */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                             <h4 className="text-sm font-bold text-gray-500 mb-4">ความคิดเห็น</h4>
                             {/* ... รายการคอมเมนต์ ... */}
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href={route('dashboard')} className="text-indigo-600 hover:underline">← กลับไปหน้าหลัก</Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}