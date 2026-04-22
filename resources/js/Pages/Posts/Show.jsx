import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CommentItem from '@/Components/CommentItem';

/**
 * @component PostShow
 * @description หน้าแสดงรายละเอียดกระทู้ฉบับเต็ม ทำหน้าที่แสดงเนื้อหาโพสต์ แกลเลอรีรูปภาพ ระบบถูกใจ (Like) และระบบจัดการความคิดเห็น (Comment)
 *
 * @param {Object} props - ข้อมูล Props ที่ได้รับมาจากเซิร์ฟเวอร์
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบันที่เข้าสู่ระบบ
 * @param {Object} props.post - ข้อมูลรายละเอียดโพสต์ รายการความคิดเห็น และรายการถูกใจ
 * @param {number|string|null} props.highlightId - รหัส (ID) ของความคิดเห็นเป้าหมายที่ต้องการเน้นแสดงผล
 * @returns {JSX.Element}
 */
export default function Show({ auth, post, highlightId }) {
    // ==========================================
    // State & Form Management (การจัดการสถานะและฟอร์ม)
    // ==========================================

    /** * @state {Object|null} replyingTo - เก็บข้อมูลความคิดเห็นที่ผู้ใช้กำลังเลือกเพื่อตอบกลับ 
     */
    const [replyingTo, setReplyingTo] = useState(null);
    
    /** * @state {Object|null} editingComment - เก็บข้อมูลความคิดเห็นที่ผู้ใช้กำลังแก้ไข 
     */
    const [editingComment, setEditingComment] = useState(null);

    /** * @state {boolean} localIsLiked - สถานะการกดถูกใจบนฝั่งไคลเอนต์ (Optimistic UI) 
     */
    const [localIsLiked, setLocalIsLiked] = useState(false);

    /** * @state {number} localLikeCount - จำนวนยอดถูกใจสะสมบนฝั่งไคลเอนต์ (Optimistic UI) 
     */
    const [localLikeCount, setLocalLikeCount] = useState(0);

    /** * @description การจัดการฟอร์มสำหรับสร้างหรือแก้ไขความคิดเห็นผ่าน Inertia.js
     */
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
    // Effects (การซิงโครไนซ์ข้อมูล)
    // ==========================================

    /**
     * @description ซิงโครไนซ์สถานะการถูกใจ (Like) ระหว่างข้อมูล Local และข้อมูลจาก Server
     * ทำงานทุกครั้งที่ข้อมูล post.likes หรือผู้ใช้งานเปลี่ยนไป
     */
    useEffect(() => {
        const isLiked = post.likes?.some(like => like.user_id === auth.user.id) || false;
        setLocalIsLiked(isLiked);
        setLocalLikeCount(post.likes?.length || 0);
    }, [post.likes, auth.user.id]);

    // ==========================================
    // Helper Functions (ฟังก์ชันช่วยเหลือ)
    // ==========================================

    /**
     * @function containsHighlight
     * @description ค้นหาว่าในความคิดเห็นหลัก หรือความคิดเห็นย่อย (Replies) มีรายการที่ตรงกับ targetId หรือไม่ (ค้นหาแบบ Recursive)
     * @param {Object} comment - ข้อมูลความคิดเห็นที่ต้องการตรวจสอบ
     * @param {number|string} targetId - รหัสความคิดเห็นที่ต้องการค้นหา
     * @returns {boolean} คืนค่า true หากพบความคิดเห็นที่ตรงกัน
     */
    const containsHighlight = (comment, targetId) => {
        if (comment.id === targetId) return true;
        if (comment.replies && comment.replies.length > 0) {
            return comment.replies.some(reply => containsHighlight(reply, targetId));
        }
        return false;
    };

    // ==========================================
    // Data Processing (การประมวลผลข้อมูลก่อนแสดงผล)
    // ==========================================

    /** * @constant {Array} sortedComments 
     * @description จัดเรียงลำดับความคิดเห็น โดยดึงรายการที่มีการไฮไลต์ (หรือมีคอมเมนต์ย่อยที่ถูกไฮไลต์) ขึ้นมาไว้บนสุด
     */
    const sortedComments = [...(post.comments || [])].sort((a, b) => {
        const aHasHighlight = containsHighlight(a, highlightId);
        const bHasHighlight = containsHighlight(b, highlightId);
        
        if (aHasHighlight && !bHasHighlight) return -1;
        if (!aHasHighlight && bHasHighlight) return 1;
        return 0;
    });

    // ==========================================
    // Handlers (ฟังก์ชันจัดการเหตุการณ์)
    // ==========================================

    /**
     * @function handleLike
     * @description จัดการการกดถูกใจโพสต์ โดยอัปเดตหน้าจอทันที (Optimistic UI) ก่อนส่งคำขอไปยังเซิร์ฟเวอร์
     */
    const handleLike = () => {
        // อัปเดตสถานะบนหน้าจอทันทีเพื่อความลื่นไหลในการใช้งาน
        const newIsLiked = !localIsLiked;
        setLocalIsLiked(newIsLiked);
        setLocalLikeCount(newIsLiked ? localLikeCount + 1 : localLikeCount - 1);

        // ส่งข้อมูลอัปเดตไปยัง Backend
        router.post(route('posts.like', post.id), {}, {
            preserveScroll: true, // รักษาระดับการเลื่อนหน้าจอไว้ตำแหน่งเดิม
            preserveState: true,  // รักษาสถานะ Component ปัจจุบัน
            onError: () => {
                // ย้อนกลับเป็นสถานะเดิมหากเกิดข้อผิดพลาดในการส่งข้อมูล
                setLocalIsLiked(localIsLiked);
                setLocalLikeCount(localLikeCount);
            }
        });
    };

    /**
     * @function handleCommentSubmit
     * @description จัดการการส่งฟอร์มความคิดเห็น (รองรับทั้งการสร้างใหม่และการแก้ไข)
     * @param {Event} e - Form Submit Event
     */
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        
        if (editingComment) {
            // โหมดแก้ไขความคิดเห็นเดิม
            patchComment(route('comments.update', editingComment.id), {
                onSuccess: () => { 
                    setEditingComment(null); 
                    resetComment(); 
                },
                preserveScroll: true,
            });
        } else {
            // โหมดสร้างความคิดเห็นใหม่ (หรือตอบกลับ)
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
    // Render (ส่วนแสดงผล)
    // ==========================================

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">กระทู้ฉบับเต็ม ✨</h2>}>
            <Head title={`Post: ${post.title}`} />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        
                        {/* --- ส่วนเนื้อหาหลักของโพสต์ --- */}
                        <h3 className="text-3xl font-bold mb-4">{post.title}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap mb-8 text-lg">{post.content}</p>

                        {/* --- ส่วนแสดงแกลเลอรีรูปภาพ --- */}
                        {post.images && post.images.length > 0 && (
                            <div className={`grid gap-2 mb-8 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {post.images.map(img => (
                                    <img 
                                        key={img.id} 
                                        src={`${img.image_url}?t=${new Date().getTime()}`}
                                        alt="content" 
                                        className="w-full rounded-2xl shadow-sm border object-cover max-h-[500px]" 
                                    />
                                ))}
                            </div>
                        )}

                        {/* --- ส่วนปุ่มจัดการถูกใจ (Like Section) --- */}
                        <div className="flex items-center py-4 border-y border-gray-100 mb-6">
                            <button 
                                onClick={handleLike} 
                                className={`flex items-center gap-2 font-bold transition-all duration-300 ${
                                    localIsLiked ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-rose-400'
                                }`}
                            >
                                <svg 
                                    className="w-6 h-6" 
                                    fill={localIsLiked ? "currentColor" : "none"} 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    ></path>
                                </svg>
                                <span>{localLikeCount > 0 ? `${localLikeCount} ถูกใจ` : 'ถูกใจ'}</span>
                            </button>
                        </div>

                        {/* --- ส่วนแสดงรายการความคิดเห็น --- */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Comments</h4>
                            
                            <div className="space-y-2">
                                {/* กรองเฉพาะความคิดเห็นหลัก (ไม่มี parent_id) แล้วนำมาแสดงผล */}
                                {sortedComments.filter(c => !c.parent_id).map(comment => (
                                    <CommentItem 
                                        key={comment.id} 
                                        comment={comment} 
                                        auth={auth} 
                                        highlightId={highlightId}
                                        onReply={(c) => { 
                                            setEditingComment(null); 
                                            setReplyingTo(c); 
                                            setCommentForm({ content: '', parent_id: c.id }); 
                                        }}
                                        onEdit={(c) => { 
                                            setReplyingTo(null); 
                                            setEditingComment(c); 
                                            setCommentForm('content', c.content); 
                                        }}
                                        onDelete={(id) => {
                                            if (confirm('ลบคอมเมนต์นี้?')) {
                                                router.delete(route('comments.destroy', id), { preserveScroll: true });
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            {/* --- ส่วนฟอร์มส่ง/แก้ไขความคิดเห็น --- */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                
                                {/* แถบสถานะ: กำลังตอบกลับ */}
                                {replyingTo && (
                                    <div className="mb-2 flex justify-between items-center bg-indigo-50 px-3 py-1 rounded-lg text-xs text-indigo-600 font-medium">
                                        <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                                        <button onClick={() => { setReplyingTo(null); resetComment(); }} className="font-bold hover:text-indigo-800">✕</button>
                                    </div>
                                )}

                                {/* แถบสถานะ: กำลังแก้ไข */}
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