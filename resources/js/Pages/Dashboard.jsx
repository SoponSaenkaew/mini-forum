import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react'; 
import { useState, useRef, useCallback } from 'react';
import PostItem from '@/Components/PostItem'; 

/**
 * @component Dashboard
 * @description คอมโพเนนต์หน้า Dashboard แสดงฟีดโพสต์ แบบฟอร์มสร้างโพสต์ และผลการค้นหาผู้ใช้งาน
 * ได้รับการปรับแต่งเพื่อประสิทธิภาพสูงสุด (Performance) และการเข้าถึง (Accessibility) ตามมาตรฐาน Lighthouse
 */
export default function Dashboard({ auth, posts, searchedUsers = [], filters = {} }) {
    
    // --- การจัดการสถานะฟอร์มสร้างโพสต์ (Post Form Management) ---
    const { data, setData, post, processing, reset, errors } = useForm({ 
        title: '', 
        content: '', 
        images: [] 
    });

    const [previews, setPreviews] = useState([]);
    const firstPost = (Array.isArray(posts) ? posts[0] : Object.values(posts || {})[0]);
    const firstPostImage = firstPost?.images?.[0]?.image_url;
    const lcpImageUrl = firstPostImage 
        ? `${firstPostImage}?width=600&quality=65&format=webp` 
        : null;

    /**
     * @function handleImageChange
     * @description ตรวจสอบไฟล์รูปภาพที่ผู้ใช้อัปโหลดและสร้าง URL สำหรับแสดงตัวอย่าง (Preview)
     */
    const handleImageChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        
        // ข้อจำกัด: อัปโหลดได้สูงสุด 5 ไฟล์
        if (data.images.length + files.length > 5) {
            return alert('สามารถอัปโหลดรูปภาพได้สูงสุด 5 รูปเท่านั้น');
        }
        
        // ข้อจำกัด: ขนาดไฟล์รวมต้องไม่เกิน 8 MB
        const currentSize = data.images.reduce((acc, f) => acc + f.size, 0);
        const newSize = files.reduce((acc, f) => acc + f.size, 0);
        if (currentSize + newSize > 8 * 1024 * 1024) {
            return alert('ขนาดไฟล์รูปภาพรวมต้องไม่เกิน 8 MB');
        }

        setData('images', [...data.images, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        
        // ล้างค่า input เพื่อให้สามารถเลือกไฟล์เดิมได้ในกรณีที่มีการลบออก
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [data.images, setData]);

    /**
     * @function handleRemoveImage
     * @description ลบรูปภาพที่เลือกออกจากรายการอัปโหลดและคืนค่าหน่วยความจำ
     */
    const handleRemoveImage = useCallback((index) => {
        const updatedImages = [...data.images];
        updatedImages.splice(index, 1);
        setData('images', updatedImages);

        URL.revokeObjectURL(previews[index]);
        const updatedPreviews = [...previews];
        updatedPreviews.splice(index, 1);
        setPreviews(updatedPreviews);
    }, [data.images, previews, setData]);

    /**
     * @function handleCreatePost
     * @description ส่งข้อมูลโพสต์ไปยังเซิร์ฟเวอร์และล้างสถานะฟอร์มเมื่อสำเร็จ
     */
    const handleCreatePost = useCallback((e) => {
        e.preventDefault();
        post(route('posts.store'), { 
            onSuccess: () => { 
                reset(); 
                previews.forEach(url => URL.revokeObjectURL(url));
                setPreviews([]);
            } 
        });
    }, [post, previews, reset]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800">Community Feed</h2>}>
            <Head title="Dashboard">
                {/* สั่ง Preload รูปภาพ LCP ตั้งแต่บรรทัดแรก */}
                {lcpImageUrl && (
                    <link rel="preload" as="image" href={lcpImageUrl} fetchpriority="high" crossOrigin="anonymous" />
                )}
            </Head>

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ส่วนแบบฟอร์มสร้างโพสต์ (ซ่อนการแสดงผลเมื่อมีการใช้คำค้นหา) */}
                    {!filters.search && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                
                                {/* 🌟 [Lighthouse A11y] ใช้ label คู่กับ id เสมอ */}
                                <div>
                                    <label htmlFor="post-title" className="sr-only">หัวข้อโพสต์</label>
                                    <input 
                                        id="post-title"
                                        type="text" 
                                        value={data.title} 
                                        placeholder="ระบุหัวข้อโพสต์ของคุณ..." 
                                        className={`w-full border-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'ring-2 ring-red-500' : ''}`}
                                        onChange={e => setData('title', e.target.value)} 
                                    />
                                    {errors.title && <div className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.title}</div>}
                                </div>
                                
                                <div>
                                    <label htmlFor="post-content" className="sr-only">เนื้อหาโพสต์</label>
                                    <textarea 
                                        id="post-content"
                                        value={data.content} 
                                        placeholder="ระบุเนื้อหาที่คุณต้องการแบ่งปัน..." 
                                        
                                        className={`w-full border-none bg-gray-50 rounded-xl h-32 focus:ring-2 focus:ring-indigo-500 resize-none ${errors.content ? 'ring-2 ring-red-500' : ''}`}
                                        onChange={e => setData('content', e.target.value)}
                                    />
                                    {errors.content && <div className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.content}</div>}
                                </div>

                                {/* แสดงตัวอย่างรูปภาพก่อนอัปโหลด (Image Previews) */}
                                {previews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative aspect-square">
                                                <img 
                                                    src={url} 
                                                    // 🌟 [Lighthouse Performance] ป้องกัน Layout Shift
                                                    width="400"
                                                    height="400"
                                                    loading="lazy"
                                                    decoding="async"
                                                    alt={`ตัวอย่างภาพที่ ${index + 1}`}
                                                    className="h-full w-full object-cover rounded-lg border shadow-sm" 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveImage(index)}
                                                    aria-label={`ลบตัวอย่างภาพที่ ${index + 1}`}
                                                    // 🌟 [Lighthouse A11y] ขยายพื้นที่ Touch Target เป็น 44x44
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-transform active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm font-semibold p-2 -ml-2 rounded-lg hover:bg-indigo-50 transition focus-within:ring-2 focus-within:ring-indigo-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        เพิ่มรูปภาพ
                                        <input type="file" multiple className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                                    </label>

                                    <button 
                                        disabled={processing} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-bold transition shadow-lg shadow-indigo-100 disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        {processing ? 'กำลังประมวลผล...' : 'เผยแพร่โพสต์'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ส่วนแสดงผลลัพธ์การค้นหาบัญชีผู้ใช้งาน */}
                    {filters.search && searchedUsers?.length > 0 && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-2xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                ผลการค้นหาผู้ใช้งาน
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {searchedUsers?.map(user => (
                                    <Link key={user.id} href={route('profile.show', user.id)} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url} 
                                                // 🌟 [Lighthouse Performance] ระบุขนาดภาพเพื่อลด Layout Shift
                                                width="40"
                                                height="40"
                                                className="h-10 w-10 rounded-full object-cover border" 
                                                alt={`รูปโปรไฟล์ของ ${user.name}`} 
                                                loading="lazy" 
                                                decoding="async" 
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold" aria-hidden="true">{user.name[0]}</div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{user.name}</div>
                                            <div className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">ดูโปรไฟล์ ➔</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* แสดงข้อความเมื่อไม่พบผลลัพธ์การค้นหา */}
                    {filters.search && searchedUsers?.length === 0 && posts?.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลที่ตรงกับคำค้นหาของคุณ</p>
                            <p className="text-sm text-gray-400">กรุณาลองใช้คำค้นหาอื่นอีกครั้ง</p>
                        </div>
                    )}

                    {/* ส่วนแสดงรายการโพสต์ (Feed Section) */}
                    <div className="space-y-4">
                        {(Array.isArray(posts) ? posts : Object.values(posts || {}))?.map((post, index) => (
                            <PostItem 
                                key={post?.id || index} 
                                post={post} 
                                auth={auth} 
                                isFirst={index === 0} 
                            />
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
