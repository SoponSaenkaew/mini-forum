import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem'; // ✨ เรียกใช้ตัวกลางเดียวกับ Dashboard/Post

/**
 * Reply Page Component
 * @description หน้าต่างเฉพาะสำหรับตอบกลับคอมเมนต์ (มักจะเข้ามาจากหน้าต่างแจ้งเตือน)
 * จะทำหน้าที่แสดงคอมเมนต์ต้นทางแบบมีไฮไลท์เน้นย้ำ และแสดงฟอร์มสำหรับพิมพ์ข้อความตอบกลับไปยังเป้าหมายนั้น
 * * @param {Object} props
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบันที่เข้าสู่ระบบ
 * @param {Object} props.targetComment - ข้อมูลคอมเมนต์เป้าหมายที่ผู้ใช้ต้องการตอบกลับ (รวม post_id และข้อมูล user)
 * @returns {JSX.Element}
 */
export default function ReplyPage({ auth, targetComment }) {
    
    // ==========================================
    // Form & State Management
    // ==========================================

    /**
     * @type {Object} form - อินสแตนซ์จัดการฟอร์มจาก useForm ของ Inertia.js 
     * ใช้เก็บข้อมูลข้อความตอบกลับ และล็อกค่า parent_id เพื่อผูกให้เป็นคอมเมนต์ลูกของเป้าหมายเสมอ
     */
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        parent_id: targetComment.id, // ✨ ล็อก ID ไว้ตอบตัวนี้โดยเฉพาะ
    });

    // ==========================================
    // Handlers
    // ==========================================

    /**
     * @function submit
     * @description จัดการการส่งฟอร์ม (Submit)
     * ยิงข้อมูลไปยัง Route ของระบบหลังบ้านเพื่อบันทึกคอมเมนต์ใหม่ลงในโพสต์เดียวกันกับคอมเมนต์เป้าหมาย
     * @param {React.FormEvent} e 
     */
    const submit = (e) => {
        e.preventDefault();
        
        // ส่งข้อมูลอ้างอิงตามโพสต์ ID จาก targetComment
        post(route('comments.store', targetComment.post_id), { 
            onSuccess: () => reset() // ล้างค่าฟอร์มเมื่อส่งสำเร็จ
        });
    };

    // ==========================================
    // Render
    // ==========================================

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">ตอบกลับความคิดเห็น ✨</h2>}>
            <Head title="Reply to Comment" />
            
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- Section: แสดงคอมเมนต์เป้าหมาย (Target Comment) --- */}
                    {/* ✨ ออกแบบกรอบให้เป็นสีทอง (amber) เพื่อเน้นย้ำผู้ใช้ว่ากำลังตอบกลับใครอยู่ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 mb-6">
                        <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-4 tracking-widest">
                            คอมเมนต์เป้าหมาย
                        </h4>
                        
                        {/* * เรียกใช้ CommentItem 
                          * ส่งค่า highlightId ให้ตรงกับเป้าหมายเพื่อให้ Component ปลายทางแสดงเอฟเฟกต์สีทอง
                          */}
                        <CommentItem 
                            comment={targetComment} 
                            auth={auth} 
                            highlightId={targetComment.id} // ✨ สั่งให้ไฮไลท์ตัวนี้
                            onReply={() => {}} // ปล่อยว่างไว้เพราะอยู่ในหน้าตอบกลับอยู่แล้ว ป้องกันผู้ใช้กดซ้ำซ้อน
                        />
                    </div>

                    {/* --- Section: ฟอร์มสำหรับพิมพ์ตอบกลับ (Reply Form) --- */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <form onSubmit={submit} className="space-y-4">
                            
                            <label className="block text-sm font-bold text-gray-700">
                                พิมพ์คำตอบกลับถึง @{targetComment.user.name}
                            </label>
                            
                            <textarea 
                                value={data.content} 
                                onChange={e => setData('content', e.target.value)} 
                                className="w-full border-gray-200 rounded-xl h-32 focus:ring-indigo-500 resize-y" 
                                placeholder="ใส่ความคิดเห็นของคุณที่นี่..." 
                            />
                            
                            {/* แถบเครื่องมือปุ่มกด (Action Bar) */}
                            <div className="flex justify-end gap-2 items-center">
                                <Link 
                                    href={route('notifications.index')} 
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition font-medium"
                                >
                                    ยกเลิก
                                </Link>
                                <button 
                                    disabled={processing || !data.content.trim()} 
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                                >
                                    ส่งคำตอบกลับ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}