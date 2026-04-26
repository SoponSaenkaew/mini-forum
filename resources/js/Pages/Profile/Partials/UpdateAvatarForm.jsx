import { useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * @component UpdateAvatarForm
 * @description คอมโพเนนต์ฟอร์มสำหรับเปลี่ยนรูปโปรไฟล์ (Avatar) ของผู้ใช้งาน
 * มาพร้อมกับระบบแสดงรูปตัวอย่าง (Image Preview) ทันทีที่ผู้ใช้เลือกไฟล์ก่อนทำการอัปโหลด
 *
 * @param {Object} props - ข้อมูล Props ที่คอมโพเนนต์ได้รับ
 * @param {string|null} props.currentAvatar - พาธของรูปโปรไฟล์ปัจจุบันของผู้ใช้งานที่เก็บในฐานข้อมูล (ถ้ามี)
 * @returns {JSX.Element}
 */
export default function UpdateAvatarForm({ currentAvatar }) {
    
    /**
     * @state {string|null} previewUrl
     * @description เก็บ URL จำลองของรูปภาพที่ผู้ใช้เลือก เพื่อนำมาแสดงผลเป็นตัวอย่าง (Preview)
     */
    const [previewUrl, setPreviewUrl] = useState(null);
    
    /**
     * @description การจัดการข้อมูลฟอร์มสำหรับการอัปโหลดไฟล์ผ่าน Inertia.js
     */
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        avatar: null,
    });

    /**
     * @function handleFileChange
     * @description จัดการเหตุการณ์เมื่อผู้ใช้เลือกไฟล์รูปภาพใหม่ 
     * ทำหน้าที่เก็บข้อมูลไฟล์ลงในฟอร์ม และสร้าง URL จำลองสำหรับแสดงรูปตัวอย่าง
     * @param {Event} e - Input Change Event
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    /**
     * @function submit
     * @description จัดการการส่งฟอร์ม (Submit) เพื่อนำไฟล์รูปภาพไปบันทึกที่เซิร์ฟเวอร์
     * @param {Event} e - Form Submit Event
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('profile.avatar.update'), {
            preserveScroll: true, // รักษาระดับการเลื่อนหน้าจอไว้ตำแหน่งเดิม
            onSuccess: () => {
                setPreviewUrl(null); // ล้างรูปตัวอย่างทิ้งเมื่ออัปโหลดเสร็จสมบูรณ์
                alert('อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
            },
        });
    };

    return (
        <section className="max-w-xl">
            <header>
                <h2 className="text-lg font-medium text-gray-900">รูปโปรไฟล์ 👤</h2>
                <p className="mt-1 text-sm text-gray-600">อัปโหลดรูปภาพใหม่เพื่อเปลี่ยนสไตล์ของคุณ</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                    
                    {/* บริเวณแสดงรูปโปรไฟล์ (Current Avatar หรือ Preview) */}
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-indigo-100 shadow-sm">
                        {previewUrl ? (
                            <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                        ) : currentAvatar ? (
                            <img src={currentAvatar} className="h-full w-full object-cover" alt="Current Avatar" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-indigo-300 font-bold">?</div>
                        )}
                    </div>

                    {/* ปุ่มเลือกไฟล์รูปภาพ */}
                    <div className="flex-1">
                        <input 
                            type="file" 
                            aria-label="อัปโหลดรูปโปรไฟล์"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                        />
                        {/* แสดงข้อความแจ้งเตือนกรณีอัปโหลดไฟล์ไม่ถูกต้อง */}
                        {errors.avatar && <p className="mt-2 text-xs text-red-600 font-medium">{errors.avatar}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* ปุ่มยืนยันการบันทึกข้อมูล */}
                    <button 
                        disabled={processing || !data.avatar} 
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 shadow-sm shadow-indigo-100"
                    >
                        {processing ? 'กำลังอัปโหลด...' : 'บันทึกรูปภาพ ✨'}
                    </button>

                    {/* ข้อความแจ้งสถานะเมื่อบันทึกข้อมูลสำเร็จ */}
                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 font-medium animate-pulse">อัปโหลดสำเร็จ ✅</p>
                    )}
                </div>
            </form>
        </section>
    );
}
