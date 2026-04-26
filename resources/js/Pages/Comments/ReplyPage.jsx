import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';

/**
 * @component ReplyPage
 * @description หน้าต่างเฉพาะสำหรับแสดงแบบฟอร์มตอบกลับความคิดเห็น (Dedicated Reply View)
 * นำเสนอคอมเมนต์เป้าหมายพร้อมแถบไฮไลท์ เพื่อลดความสับสนและเพิ่มบริบทให้ผู้ใช้งาน 
 * ได้รับการปรับแต่งมาตรฐานการเข้าถึง (Accessibility) และประสิทธิภาพ (Performance)
 *
 * @param {Object} props
 * @param {Object} props.auth - ข้อมูลและสิทธิ์ของผู้ใช้งานปัจจุบัน
 * @param {Object} props.targetComment - ข้อมูลเป้าหมายการตอบกลับ (ประกอบด้วย User และ Post ID)
 */
export default function ReplyPage({ auth, targetComment }) {
    
    // ==========================================
    // 1. การจัดการสถานะแบบฟอร์ม (Form & State Management)
    // ==========================================

    const { data, setData, post, processing, reset } = useForm({
        content: '',
        parent_id: targetComment.id, // ผูก ID เพื่อระบุว่าเป็นคอมเมนต์ย่อยของเป้าหมายนี้
    });

    // ==========================================
    // 2. ฟังก์ชันจัดการเหตุการณ์ (Event Handlers)
    // ==========================================

    /**
     * @function submit
     * @description ส่งข้อมูลข้อความตอบกลับไปยังระบบหลังบ้าน และล้างข้อมูลฟอร์มเมื่อประมวลผลสำเร็จ
     * @param {React.FormEvent} e 
     */
    const submit = (e) => {
        e.preventDefault();
        
        post(route('comments.store', targetComment.post_id), { 
            onSuccess: () => reset() 
        });
    };

    // ==========================================
    // 3. การแสดงผล (Render)
    // ==========================================

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">ตอบกลับความคิดเห็น ✨</h2>}>
            
            {/* การตั้งค่า Metadata สำหรับ SEO และ Browser Tab */}
            <Head>
                <title>{`ตอบกลับ @${targetComment.user.name} - Tuna Forum`}</title>
                <meta name="description" content={`ร่วมสนทนาและตอบกลับความคิดเห็นของ ${targetComment.user.name} บน Tuna Forum`} />
            </Head>
            
            <main className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- ส่วนที่ 1: พื้นที่แสดงคอมเมนต์เป้าหมาย (Target Comment Section) --- */}
                    <section aria-labelledby="target-comment-heading" className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200">
                        <h3 id="target-comment-heading" className="text-[10px] font-bold text-amber-600 uppercase mb-4 tracking-widest">
                            คอมเมนต์เป้าหมาย
                        </h3>
                        
                        {/* เรนเดอร์คอมเมนต์ต้นทาง โดยบังคับให้แสดงผลแบบไฮไลท์ (highlightId) 
                          และปิดการทำงานของปุ่มตอบกลับภายใน (onReply) เพื่อป้องกันการกดซ้ำซ้อน
                        */}
                        <CommentItem 
                            comment={targetComment} 
                            auth={auth} 
                            highlightId={targetComment.id} 
                            onReply={() => {}} 
                        />
                    </section>

                    {/* --- ส่วนที่ 2: พื้นที่กรอกข้อความตอบกลับ (Reply Form Section) --- */}
                    <section aria-labelledby="reply-form-heading" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 id="reply-form-heading" className="sr-only">ฟอร์มตอบกลับข้อความ</h3>
                        
                        <form onSubmit={submit} className="space-y-4">
                            
                            <div>
                                <label htmlFor="reply-content" className="block text-sm font-bold text-gray-700 mb-2">
                                    พิมพ์คำตอบกลับถึง @{targetComment.user.name}
                                </label>
                                
                                <textarea 
                                    id="reply-content" 
                                    value={data.content} 
                                    onChange={e => setData('content', e.target.value)} 
                                    className="w-full border-gray-200 rounded-xl h-32 focus:ring-indigo-500 focus:border-indigo-500 resize-y transition-colors" 
                                    placeholder="กรอกความคิดเห็นของคุณที่นี่..." 
                                    required
                                    aria-required="true"
                                />
                            </div>
                            
                            {/* แถบคำสั่ง (Action Bar) */}
                            <div className="flex justify-end gap-3 items-center pt-2">
                                <Link 
                                    href={route('notifications.index')} 
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition font-bold focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-xl min-h-[44px]"
                                    aria-label="ยกเลิกการตอบกลับและกลับสู่หน้าแจ้งเตือน"
                                >
                                    ยกเลิก
                                </Link>
                                
                                <button 
                                    type="submit"
                                    disabled={processing || !data.content.trim()} 
                                    className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-h-[44px]"
                                >
                                    {processing ? 'กำลังส่งข้อมูล...' : 'ส่งคำตอบกลับ'}
                                </button>
                            </div>
                        </form>
                    </section>

                </div>
            </main>
        </AuthenticatedLayout>
    );
}
