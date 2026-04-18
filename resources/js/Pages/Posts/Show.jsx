import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CommentItem from '@/Components/CommentItem';

/**
 * Post Show Component (หน้าดูกระทู้ฉบับเต็ม)
 * @description แสดงรายละเอียดโพสต์เต็มรูปแบบ รูปภาพแกลเลอรี ระบบถูกใจ และระบบจัดการคอมเมนต์
 * @param {Object} props
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบัน
 * @param {Object} props.post - ข้อมูลโพสต์พร้อมคอมเมนต์และรายการถูกใจ
 * @param {number|string|null} props.highlightId - ID ของคอมเมนต์เป้าหมายที่ต้องการไฮไลท์
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

    /** @type {[boolean, Function]} localIsLiked - สถานะการกดถูกใจในเครื่อง (Optimistic UI) */
    const [localIsLiked, setLocalIsLiked] = useState(false);

    /** @type {[number, Function]} localLikeCount - จำนวนการกดถูกใจในเครื่อง (Optimistic UI) */
    const [localLikeCount, setLocalLikeCount] = useState(0);

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
    // Effects (Synchronization)
    // ==========================================

    /**
     * @effect Sync Like State
     * @description ซิงค์ข้อมูล Local State กับข้อมูลที่ได้รับมาจาก Server (Props) เมื่อมีการอัปเดต
     */
    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้ปัจจุบันกดถูกใจโพสต์นี้ไปแล้วหรือยัง
        const isLiked = post.likes?.some(like => like.user_id === auth.user.id) || false;
        setLocalIsLiked(isLiked);
        setLocalLikeCount(post.likes?.length || 0);
    }, [post.likes, auth.user.id]);

    // ==========================================
    // Helper Functions
    // ==========================================

    /**
     * @function containsHighlight
     * @description ตรวจสอบว่าคอมเมนต์หรือคอมเมนต์ลูกมี targetId หรือไม่ (Recursive Search)
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
     * @description จัดเรียงคอมเมนต์โดยดันรายการที่ถูกไฮไลท์ขึ้นมาไว้ด้านบนสุด
     */
    const sortedComments = [...(post.comments || [])].sort((a, b) => {
        const aHasHighlight = containsHighlight(a, highlightId);
        const bHasHighlight = containsHighlight(b, highlightId);
        
        if (aHasHighlight && !bHasHighlight) return -1;
        if (!aHasHighlight && bHasHighlight) return 1;
        return 0;
    });

    // ==========================================
    // Handlers
    // ==========================================

    /**
     * @function handleLike
     * @description จัดการการกดถูกใจด้วยเทคนิค Optimistic UI (เปลี่ยนสถานะทันทีในเครื่องก่อนส่งไป Server)
     */
    const handleLike = () => {
        // เปลี่ยนสถานะทันทีเพื่อให้ผู้ใช้รู้สึกว่าระบบเร็ว
        const newIsLiked = !localIsLiked;
        setLocalIsLiked(newIsLiked);
        setLocalLikeCount(newIsLiked ? localLikeCount + 1 : localLikeCount - 1);

        // ส่งข้อมูลไปยัง Backend
        router.post(route('posts.like', post.id), {}, {
            preserveScroll: true, // ป้องกันหน้าเลื่อน
            preserveState: true,
            onError: () => {
                // หากเกิดข้อผิดพลาด ให้ย้อนสถานะกลับเป็นค่าเดิม
                setLocalIsLiked(localIsLiked);
                setLocalLikeCount(localLikeCount);
            }
        });
    };

    /**
     * @function handleCommentSubmit
     * @description จัดการการส่งฟอร์มคอมเมนต์
     */
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (editingComment) {
            patchComment(route('comments.update', editingComment.id), {
                onSuccess: () => { 
                    setEditingComment(null); 
                    resetComment(); 
                },
                preserveScroll: true,
            });
        } else {
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
                        
                        {/* Section: เนื้อหาหลักของโพสต์ */}
                        <h3 className="text-3xl font-bold mb-4">{post.title}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap mb-8 text-lg">{post.content}</p>

                        {/* รูปภาพ Gallery (รองรับหลายรูป) */}
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

                        {/* ✨ Section: แถบปุ่มถูกใจ (Like Section) */}
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

                        {/* Section: ส่วนแสดงความคิดเห็น */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Comments</h4>
                            
                            <div className="space-y-2">
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
                                            if (confirm('แน่ใจนะคะว่าจะลบคอมเมนต์นี้? 🥺')) {
                                                router.delete(route('comments.destroy', id), { preserveScroll: true });
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Section: ฟอร์มแสดงความคิดเห็น */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                {replyingTo && (
                                    <div className="mb-2 flex justify-between items-center bg-indigo-50 px-3 py-1 rounded-lg text-xs text-indigo-600 font-medium">
                                        <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                                        <button onClick={() => { setReplyingTo(null); resetComment(); }} className="font-bold hover:text-indigo-800">✕</button>
                                    </div>
                                )}

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