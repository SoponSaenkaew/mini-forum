import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UpdateAvatarForm({ currentAvatar }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        avatar: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.avatar.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPreviewUrl(null); // ✨ ล้างรูปตัวอย่างเมื่อสำเร็จ
                alert('อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
            },
        });
    };

    return (
        <section className="max-w-xl">
            <header>
                <h2 className="text-lg font-medium text-gray-900">รูปโปรไฟล์ 👤</h2>
                <p className="mt-1 text-sm text-gray-600">อัปโหลดรูปภาพใหม่เพื่อเปลี่ยนสไตล์ของคุณนะคะ</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-indigo-100 shadow-sm">
                        {previewUrl ? (
                            <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                        ) : currentAvatar ? (
                            <img src={`/storage/${currentAvatar}`} className="h-full w-full object-cover" alt="Current Avatar" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-indigo-300 font-bold">?</div>
                        )}
                    </div>

                    <div className="flex-1">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                        />
                        {errors.avatar && <p className="mt-2 text-xs text-red-600 font-medium">{errors.avatar}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        disabled={processing || !data.avatar} 
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 shadow-sm shadow-indigo-100"
                    >
                        {processing ? 'กำลังอัปโหลด...' : 'บันทึกรูปภาพ ✨'}
                    </button>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 font-medium animate-pulse">สำเร็จแล้วค่ะ! ✅</p>
                    )}
                </div>
            </form>
        </section>
    );
}