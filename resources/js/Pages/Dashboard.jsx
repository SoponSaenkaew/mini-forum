import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

// นำเข้า PostItem จากส่วนกลาง
import PostItem from '@/Components/PostItem'; 

/**
 * Dashboard Component (หน้าฟีดหลักของชุมชน)
 * @description หน้าหลักสำหรับแสดงโพสต์ทั้งหมด รองรับการค้นหา การสร้างโพสต์ใหม่ 
 * และการอัปเดตข้อมูลแบบ Real-time ผ่าน Laravel Echo
 * @param {Object} props
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานที่เข้าสู่ระบบ
 * @param {Array} props.posts - รายการโพสต์ทั้งหมดที่จะนำมาแสดงผล
 * @param {Array} props.searchedUsers - รายการผู้ใช้ที่ค้นพบจากการค้นหา (ถ้ามี)
 * @param {Object} props.filters - คำค้นหาหรือตัวกรองที่กำลังใช้งานอยู่
 * @returns {JSX.Element}
 */
export default function Dashboard({ auth, posts, searchedUsers = [], filters = {} }) {
    
    // ==========================================
    // Form & State Management
    // ==========================================

    /**
     * @type {Object} form - จัดการสถานะของฟอร์มสร้างโพสต์ใหม่
     */
    const { data, setData, post, processing, reset, errors } = useForm({ 
        title: '', 
        content: '', 
        images: []
    });
    
    /** @type {React.MutableRefObject} fileInputRef - อ้างอิงถึงช่องอัปโหลดไฟล์เพื่อเคลียร์ค่าหลังโพสต์สำเร็จ */
    const fileInputRef = useRef();

    /** @type {[string, Function]} searchQuery - สถานะของช่องค้นหาข้อมูล */
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // ==========================================
    // Effects & Event Listeners
    // ==========================================

    /**
     * Real-time Feed Listener
     * @description ดักฟัง Public Channel เพื่อรีโหลดหน้าฟีดเมื่อมีผู้ใช้คนอื่นสร้างโพสต์ใหม่
     */
    useEffect(() => {
        const channelName = 'public-feed';
        
        window.Echo.channel(channelName)
            .listen('.FeedUpdated', (e) => {
                console.log('📢 มีคนอัปเดตฟีด! กำลังดึงข้อมูลใหม่...');
                // โหลดเฉพาะข้อมูล posts ใหม่โดยไม่กระตุกหน้าจอ (preserveScroll)
                router.reload({ only: ['posts'], preserveScroll: true, preserveState: true});
            });

        // Cleanup: ออกจาก Channel เมื่อเปลี่ยนหน้า
        return () => window.Echo.leaveChannel(channelName);
    }, []);

    // ==========================================
    // Handlers
    // ==========================================

    /**
     * Handle Search Submit
     * @description ส่งคำค้นหาไปยังเซิร์ฟเวอร์โดยไม่โหลดหน้าเว็บใหม่ทั้งหน้า (Inertia Partial Reload)
     * @param {React.FormEvent} e 
     */
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { search: searchQuery }, { 
            preserveState: true, 
            replace: true 
        });
    };

    /**
     * Handle Post Creation
     * @description จัดการการส่งฟอร์มสร้างโพสต์และเคลียร์ค่าเมื่อสำเร็จ
     * @param {React.FormEvent} e 
     */
    const handleCreatePost = (e) => {
        e.preventDefault();
        post(route('posts.store'), { 
            onSuccess: () => { 
                reset(); 
                if (fileInputRef.current) fileInputRef.current.value = ''; 
            } 
        });
    };

    // ==========================================
    // Render
    // ==========================================

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Community Feed ✨</h2>}>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Section: ค้นหา (Search Bar) */}
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
                                <Link href={route('dashboard')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition flex items-center justify-center">
                                    ล้าง
                                </Link>
                            )}
                        </form>
                    </div>

                    {/* Section: แสดงผู้ใช้ที่ค้นพบ (Searched Users) */}
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
                    
                    {/* Section: ฟอร์มสร้างโพสต์ใหม่ (Create Post Form) */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-xl border border-gray-100">
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            
                            {/* Input: หัวข้อโพสต์ */}
                            <div>
                                <input 
                                    type="text" 
                                    value={data.title} 
                                    placeholder="หัวข้อที่คุณต้องการแชร์..." 
                                    className="w-full border-gray-200 rounded-lg focus:ring-indigo-500" 
                                    onChange={e => setData('title', e.target.value)} 
                                />
                                {errors.title && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.title}</div>}
                            </div>

                            {/* Input: เนื้อหาโพสต์ */}
                            <div>
                                <textarea 
                                    value={data.content} 
                                    placeholder="วันนี้มีเรื่องอะไรน่าสนใจบ้างคะเซนเซ?" 
                                    className="w-full border-gray-200 rounded-lg h-32 focus:ring-indigo-500" 
                                    onChange={e => setData('content', e.target.value)}
                                />
                                {errors.content && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.content}</div>}
                            </div>
                            
                            {/* Input: อัปโหลดรูปภาพ & ปุ่ม Submit */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <input 
                                        type="file" 
                                        multiple 
                                        ref={fileInputRef} 
                                        onChange={e => setData('images', Array.from(e.target.files))} 
                                        className="text-xs text-gray-500" 
                                    />
                                    {/* จัดการแสดง Error กรณีไฟล์ผิดประเภทหรือใหญ่เกินไป */}
                                    {errors.images && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.images}</div>}
                                    {Object.keys(errors).map(key => key.startsWith('images.') ? <div key={key} className="text-rose-500 text-xs mt-1 font-medium">{errors[key]}</div> : null)}
                                </div>

                                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50">
                                    โพสต์เลย!
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section: รายการโพสต์ (Feed) */}
                    <div className="space-y-6">
                        {posts.map(post => (
                            // ส่งข้อมูลลงไปใน Component ย่อยเพื่อจัดการการแสดงผล
                            <PostItem key={post.id} post={post} auth={auth} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}