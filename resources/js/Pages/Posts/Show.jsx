import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import CommentItem from '@/Components/CommentItem';

/**
 * Post Show Component (หน้าดูกระทู้ฉบับเต็ม)
 * @description แสดงรายละเอียดโพสต์เต็มรูปแบบ รูปภาพแกลเลอรี และระบบจัดการคอมเมนต์ (รวมถึงการไฮไลท์คอมเมนต์ที่ถูกอ้างอิง)
 * @param {Object} props
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบัน
 * @param {Object} props.post - ข้อมูลโพสต์พร้อมคอมเมนต์
 * @param {number|string|null} props.highlightId - ID ของคอมเมนต์เป้าหมายที่ต้องการไฮไลท์ (เช่น เมื่อคลิกมาจากการแจ้งเตือน)
 * @returns {JSX.Element}
 */
export default function Show({ auth, post, highlightId }) {
    // ==========================================
    // State & Form Management
    // ==========================================

    /** @type {[Object|null, Function]} replyingTo - เก็บข้อมูลคอมเมนต์ที่กำลังต้องการตอบกลับ (Reply) */
    const [replyingTo, setReplyingTo] = useState(null);
    
    /** @type {[Object|null, Function]} editingComment - เก็บข้อมูลคอมเมนต์ที่กำลังอยู่ในโหมดแก้ไข (Edit) */
    const [editingComment, setEditingComment] = useState(null);

    /** @type {Object} commentForm - จัดการฟอร์มสำหรับสร้างหรือแก้ไขคอมเมนต์ */
    const { 
        data: commentForm, 
        setData: setCommentForm, 
        post: postComment, 
        patch: patchComment, 
        reset: resetComment, 
        processing: commentProcessing 
    } = useForm({
        content: '',
        parent_id: null,
    });

    // ==========================================
    // Helper Functions
    // ==========================================

    /**
     * @function containsHighlight
     * @description ค้นหาแบบ Recursion (ทำซ้ำตัวเอง) เพื่อตรวจสอบว่าคอมเมนต์นี้หรือคอมเมนต์ย่อยของมันมี targetId หรือไม่
     * @param {Object} comment - คอมเมนต์ที่กำลังตรวจสอบ
     * @param {number|string} targetId - ID เป้าหมาย
     * @returns {boolean} - true ถ้าเจอเป้าหมาย
     */
    const containsHighlight = (comment, targetId) => {
        if (comment.id === targetId) return true;
        if (comment.replies && comment.replies.length > 0) {
            return comment.replies.some(reply => containsHighlight(reply, targetId));
        }
        return false;
    };

    // ==========================================
    // Data Processing
    // ==========================================

    /** * @constant sortedComments 
     * @description ตรรกะการจัดเรียง: ดันคอมเมนต์หลักที่มี targetId (คอมเมนต์ที่ถูกไฮไลท์) ขึ้นมาไว้บรรทัดแรกสุดของรายการ
     */
    const sortedComments = [...(post.comments || [])].sort((a, b) => {
        const aHasHighlight = containsHighlight(a, highlightId);
        const bHasHighlight = containsHighlight(b, highlightId);
        
        if (aHasHighlight && !bHasHighlight) return -1; // ดัน a ขึ้น
        if (!aHasHighlight && bHasHighlight) return 1;  // ดัน b ขึ้น
        return 0; // คงเดิม
    });

    // ==========================================
    // Handlers
    // ==========================================

    /**
     * @function handleCommentSubmit
     * @description จัดการการส่งฟอร์มคอมเมนต์ (รองรับทั้งโหมดสร้างใหม่, โหมดตอบกลับ, และโหมดแก้ไข)
     */
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (editingComment) {
            // โหมดแก้ไขคอมเมนต์
            patchComment(route('comments.update', editingComment.id), {
                onSuccess: () => { 
                    setEditingComment(null); 
                    resetComment(); 
                },
                preserveScroll: true, // ไม่ให้หน้ากระตุกเลื่อนขึ้นบนสุด
            });
        } else {
            // โหมดสร้างใหม่ / ตอบกลับ
            postComment(route('comments.store', post.id), {
                onSuccess: () => { 
                    setReplyingTo(null); 
                    resetComment(); 
                },
                preserveScroll: true,
            });
        }
    };

    // ==========================================
    // Render
    // ==========================================

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">กระทู้ฉบับเต็ม ✨</h2>}>
            <Head title={`Post: ${post.title}`} />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        
                        {/* Section: เนื้อหาหลักของโพสต์ (Post Content) */}
                        <h3 className="text-3xl font-bold mb-4">{post.title}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap mb-8 text-lg">{post.content}</p>
                        
                        {/* รูปภาพเดี่ยว (ระบบเก่า) */}
                        {post.image && (
                            <img src={`/storage/${post.image}`} className="w-full rounded-2xl mb-8 border object-cover shadow-sm" alt="content" />
                        )}

                        {/* รูปภาพ Gallery (ระบบใหม่: รองรับหลายรูป) */}
                        {post.images && post.images.length > 0 && (
                            <div className={`grid gap-2 mb-8 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {post.images.map(img => (
                                    <img 
                                        key={img.id} 
                                        src={`/storage/${img.image_path}`} 
                                        alt="content" 
                                        className="w-full rounded-2xl shadow-sm border object-cover max-h-[500px]" 
                                    />
                                ))}
                            </div>
                        )}

                        {/* Section: ส่วนแสดงความคิดเห็น (Comments Section) */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Comments</h4>
                            
                            <div className="space-y-2">
                                {/* กรองเฉพาะคอมเมนต์หลัก (ที่ไม่มี parent_id) และเรียงลำดับตาม Highlight */}
                                {sortedComments.filter(c => !c.parent_id).map(comment => (
                                    <CommentItem 
                                        key={comment.id} 
                                        comment={comment} 
                                        auth={auth} 
                                        highlightId={highlightId} // ส่งค่า Highlight ID ไปยังคอมโพเนนต์ลูก
                                        
                                        // ฟังก์ชันเมื่อกดปุ่ม "ตอบกลับ"
                                        onReply={(c) => { 
                                            setEditingComment(null); 
                                            setReplyingTo(c); 
                                            setCommentForm({ content: '', parent_id: c.id }); 
                                        }}
                                        
                                        // ฟังก์ชันเมื่อกดปุ่ม "แก้ไข"
                                        onEdit={(c) => { 
                                            setReplyingTo(null); 
                                            setEditingComment(c); 
                                            setCommentForm('content', c.content); 
                                        }}
                                        
                                        // ฟังก์ชันเมื่อกดปุ่ม "ลบ"
                                        onDelete={(id) => {
                                            if (confirm('แน่ใจนะคะว่าจะลบคอมเมนต์นี้? 🥺')) {
                                                router.delete(route('comments.destroy', id), { preserveScroll: true });
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Section: ฟอร์มแสดงความคิดเห็น (Comment Form) */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                
                                {/* แถบแจ้งเตือนเมื่ออยู่ในโหมด "ตอบกลับ" */}
                                {replyingTo && (
                                    <div className="mb-2 flex justify-between items-center bg-indigo-50 px-3 py-1 rounded-lg text-xs text-indigo-600 font-medium">
                                        <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                                        <button onClick={() => { setReplyingTo(null); resetComment(); }} className="font-bold hover:text-indigo-800">✕</button>
                                    </div>
                                )}

                                {/* แถบแจ้งเตือนเมื่ออยู่ในโหมด "แก้ไข" */}
                                {editingComment && (
                                    <div className="mb-2 flex justify-between items-center bg-amber-50 px-3 py-1 rounded-lg text-xs text-amber-600 font-medium">
                                        <span>กำลังแก้ไขคอมเมนต์ของตัวเอง ✍️</span>
                                        <button onClick={() => { setEditingComment(null); resetComment(); }} className="font-bold hover:text-amber-800">✕</button>
                                    </div>
                                )}

                                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                    <textarea 
                                        value={commentForm.content} 
                                        onChange={e => setCommentForm('content', e.target.value)} 
                                        className="flex-1 rounded-xl border-gray-200 resize-y focus:ring-indigo-500" 
                                        rows="2"
                                        placeholder="ร่วมแสดงความคิดเห็น..." 
                                    ></textarea>
                                    <button 
                                        disabled={commentProcessing || !commentForm.content.trim()} 
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        {editingComment ? 'บันทึกแก้ไข' : 'ส่ง'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}