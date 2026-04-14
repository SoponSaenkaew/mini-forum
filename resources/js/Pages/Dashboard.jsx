import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

// ✨ นำเข้า PostItem จากส่วนกลางมาใช้เลยค่ะ! (ไม่ต้องเขียนซ้ำในหน้านี้แล้ว)
import PostItem from '@/Components/PostItem'; 

// ✨ หน้า Dashboard หลัก โค้ดจะดูสะอาดขึ้นเยอะเลยค่ะ!
export default function Dashboard({ auth, posts, searchedUsers = [], filters = {} }) {
    const { data, setData, post, processing, reset, errors } = useForm({ 
        title: '', 
        content: '', 
        images: []
    });
    const fileInputRef = useRef();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    // ✨ เวทมนตร์ดักฟัง Real-time!
    useEffect(() => {
        // ดักฟังช่อง 'public-feed'
        window.Echo.channel('public-feed')
            .listen('.FeedUpdated', (e) => {
                console.log('📢 มีคนอัปเดตฟีด! กำลังดึงข้อมูลใหม่...');
                // สั่งรีโหลดเฉพาะตัวแปร posts แบบเงียบๆ ไม่ให้หน้าจอกระตุก
                router.reload({ only: ['posts'], preserveScroll: true });
            });

        // คืนค่าเมื่อปิดหน้าเว็บ
        return () => window.Echo.leaveChannel('public-feed');
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { search: searchQuery }, { 
            preserveState: true, // ไม่ต้องรีโหลดหน้าใหม่ทั้งหน้า
            replace: true 
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Community Feed ✨</h2>}>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ส่วนค้นหา */}
                    <div className="bg-white p-4 shadow-sm sm:rounded-xl border border-gray-100 flex gap-2">
                        <form onSubmit={handleSearch} className="flex w-full gap-2">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาโพสต์ หรือ ชื่อผู้ใช้..." 
                                className="flex-1 border-gray-200 rounded-lg focus:ring-indigo-500"
                            />
                            <button type="submit" className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-200 transition">
                                ค้นหา 🔍
                            </button>
                            {filters.search && (
                                <Link href={route('dashboard')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">
                                    ล้าง
                                </Link>
                            )}
                        </form>
                    </div>

                    {/* แสดงรายชื่อผู้ใช้ที่ค้นหาเจอ */}
                    {searchedUsers.length > 0 && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-600 mb-3">👤 ผู้ใช้ที่พบ:</h4>
                            <div className="flex flex-wrap gap-2">
                                {searchedUsers.map(user => (
                                    <Link key={user.id} href={route('profile.show', user.id)} className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition">
                                        <div className="h-6 w-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-800 font-bold">{user.name[0]}</div>
                                        <span className="text-sm text-indigo-900 font-medium">{user.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    
{/* ฟอร์มสร้างโพสต์ */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-xl border border-gray-100">
                        <form onSubmit={(e) => { e.preventDefault(); post(route('posts.store'), { onSuccess: () => { reset(); if (fileInputRef.current) fileInputRef.current.value = ''; } }); }} className="space-y-4">
                            
                            {/* ช่องหัวข้อ */}
                            <div>
                                <input type="text" value={data.title} placeholder="หัวข้อที่คุณต้องการแชร์..." className="w-full border-gray-200 rounded-lg focus:ring-indigo-500" onChange={e => setData('title', e.target.value)} />
                                {errors.title && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.title}</div>}
                            </div>

                            {/* ช่องเนื้อหา */}
                            <div>
                                <textarea value={data.content} placeholder="วันนี้มีเรื่องอะไรน่าสนใจบ้างคะเซนเซ?" className="w-full border-gray-200 rounded-lg h-32 focus:ring-indigo-500" onChange={e => setData('content', e.target.value)}></textarea>
                                {errors.content && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.content}</div>}
                            </div>
                            
                            <div className="flex items-center justify-between">
                                {/* ช่องอัปโหลดรูป */}
                                <div>
                                    <input type="file" multiple ref={fileInputRef} onChange={e => setData('images', Array.from(e.target.files))} className="text-xs text-gray-500" />
                                    
                                    {/* แสดง Error ของรูปภาพ (ถ้าระบบจับได้ว่าไฟล์ใหญ่ไปหรือผิดประเภท) */}
                                    {errors.images && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.images}</div>}
                                    {Object.keys(errors).map(key => key.startsWith('images.') ? <div key={key} className="text-rose-500 text-xs mt-1 font-medium">{errors[key]}</div> : null)}
                                </div>

                                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50">
                                    โพสต์เลย!
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* รายการโพสต์ */}
                    <div className="space-y-6">
                        {posts.map(post => (
                            <PostItem key={post.id} post={post} auth={auth} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}