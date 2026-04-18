// resources/js/Pages/Profile/Partials/UpdateCoverPhotoForm.jsx
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UpdateCoverPhotoForm({ currentCover }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        cover_photo: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_photo', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.cover.update'), {
            preserveScroll: true,
            onSuccess: () => setPreviewUrl(null),
        });
    };

    return (
        <section className="max-w-3xl">
            <header>
                <h2 className="text-lg font-medium text-gray-900">รูปหน้าปก 🖼️</h2>
                <p className="mt-1 text-sm text-gray-600">อัปโหลดรูปหน้าปก (Cover Photo) เพื่อตกแต่งหน้าโปรไฟล์ของคุณค่ะ</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* ✨ พื้นที่แสดงรูปตัวอย่าง (สัดส่วนแนวนอน) */}
                <div className="h-48 w-full rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 relative group">
                    {previewUrl ? (
                        <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                    ) : currentCover ? (
                        <img src={`/storage/${currentCover}`} className="h-full w-full object-cover" alt="Current Cover" />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-r from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-500 font-bold">
                            ยังไม่มีหน้าปกค่ะ
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                        />
                        {errors.cover_photo && <p className="mt-2 text-xs text-red-600 font-medium">{errors.cover_photo}</p>}
                    </div>

                    <button 
                        disabled={processing || !data.cover_photo} 
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 shadow-sm shadow-indigo-100"
                    >
                        {processing ? 'กำลังอัปโหลด...' : 'บันทึกหน้าปก ✨'}
                    </button>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 font-medium animate-pulse">หน้าปกใหม่สวยมากเลยค่ะ! ✅</p>
                    )}
                </div>
            </form>
        </section>
    );
}