import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import PostItem from '@/Components/PostItem'; 

export default function Dashboard({ auth, posts, searchedUsers = [], filters = {} }) {
    
    // ==========================================
    // Form & State Management
    // ==========================================

    const { data, setData, post, processing, reset, errors } = useForm({ 
        title: '', 
        content: '', 
        images: [] // เก็บไฟล์ File Object จริงสำหรับส่งไปยัง Server
    });

    /** @type {[string[], Function]} previews - ลิสต์ของ URL รูปภาพสำหรับแสดงผล Preview */
    const [previews, setPreviews] = useState([]);
    
    const fileInputRef = useRef();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // ==========================================
    // Handlers
    // ==========================================

    /**
     * Handle Image Selection
     * @description แปลงไฟล์ภาพเป็น URL ชั่วคราวเพื่อแสดง Preview และอัปเดต State พร้อมจำกัดจำนวนและขนาดไฟล์
     */
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // 1. ตรวจสอบจำนวนรูปรวม (จำกัดสูงสุด 5 รูป)
        const totalImagesCount = data.images.length + files.length;
        if (totalImagesCount > 5) {
            alert('อัปโหลดรูปได้สูงสุด 5 รูปเท่านั้น');
            if (fileInputRef.current) fileInputRef.current.value = ''; // ล้างค่า input เพื่อให้เลือกใหม่ได้
            return;
        }

        // 2. ตรวจสอบขนาดไฟล์รวม (จำกัดสูงสุด 8 MB)
        const currentTotalSize = data.images.reduce((acc, file) => acc + file.size, 0);
        const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);
        const maxSizeBytes = 8 * 1024 * 1024; // 8 MB

        if (currentTotalSize + newFilesSize > maxSizeBytes) {
            alert('ขนาดรูปรวมกันเกิน 8 MB ค่ะ! กรุณาลดขนาดหรือจำนวนรูปลงหน่อยนะคะ 🥺');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        
        // อัปเดตไฟล์ลงใน form data
        const updatedImages = [...data.images, ...files];
        setData('images', updatedImages);

        // สร้าง URL สำหรับ Preview
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        
        // ล้างค่า input เพื่อให้ผู้ใช้สามารถกดเลือกไฟล์เดิมซ้ำได้ในกรณีที่ลบออกไปแล้ว
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /**
     * Remove Image
     * @description ลบรูปภาพออกจากทั้งลิสต์ที่จะอัปโหลดและลิสต์ Preview
     * @param {number} index 
     */
    const handleRemoveImage = (index) => {
        // ลบไฟล์จริง
        const updatedImages = [...data.images];
        updatedImages.splice(index, 1);
        setData('images', updatedImages);

        // ลบ Preview และคืนหน่วยความจำ (Memory Management)
        URL.revokeObjectURL(previews[index]);
        const updatedPreviews = [...previews];
        updatedPreviews.splice(index, 1);
        setPreviews(updatedPreviews);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { search: searchQuery }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleCreatePost = (e) => {
        e.preventDefault();
        post(route('posts.store'), { 
            onSuccess: () => { 
                reset(); 
                // ล้างค่า Preview และ Input หลังโพสต์สำเร็จ
                previews.forEach(url => URL.revokeObjectURL(url));
                setPreviews([]);
                if (fileInputRef.current) fileInputRef.current.value = ''; 
            } 
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Community</h2>}>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Search Bar */}
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
                        </form>
                    </div>

                    {/* Create Post Form */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-xl border border-gray-100">
                        <form onSubmit={handleCreatePost} className="space-y-4">
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

                            <div>
                                <textarea 
                                    value={data.content} 
                                    placeholder="วันนี้มีเรื่องอะไรน่าสนใจบ้าง..." 
                                    className="w-full border-gray-200 rounded-lg h-32 focus:ring-indigo-500" 
                                    onChange={e => setData('content', e.target.value)}
                                />
                                {errors.content && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.content}</div>}
                            </div>

                            {/* ส่วนแสดงภาพ Preview */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-2">
                                    {previews.map((url, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img 
                                                src={url} 
                                                className="h-full w-full object-cover rounded-xl border border-gray-200 shadow-sm" 
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-transform transform hover:scale-110"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        เพิ่มรูปภาพ
                                        <input 
                                            type="file" 
                                            multiple 
                                            className="hidden"
                                            ref={fileInputRef} 
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </label>
                                    {errors.images && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.images}</div>}
                                    
                                   
                                    <p className="text-[10px] text-gray-400 mt-1">สูงสุด 5 รูป (รวมไม่เกิน 8MB)</p>
                                </div>

                                <button 
                                    disabled={processing} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold transition shadow-md disabled:opacity-50"
                                >
                                    {processing ? 'กำลังส่ง...' : 'โพสต์เลย!'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Feed Section */}
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
