import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import CommentItem from '@/Components/CommentItem';

/**
 * @component Show
 * @description หน้าแสดงรายละเอียดกระทู้ฉบับเต็ม (Full Post View) 
 * รองรับการแสดงเนื้อหา รูปภาพ ระบบถูกใจ และระบบจัดการความคิดเห็นแบบย่อย 
 * ได้รับการปรับแต่งประสิทธิภาพด้วย React Hooks (useMemo, useCallback) และมาตรฐาน Lighthouse
 *
 * @param {Object} props - ข้อมูล Props ที่ได้รับมาจากเซิร์ฟเวอร์ (Inertia)
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบันที่เข้าสู่ระบบ
 * @param {Object} props.post - ข้อมูลรายละเอียดโพสต์ รายการความคิดเห็น และยอดถูกใจ
 * @param {number|string|null} props.highlightId - รหัสของความคิดเห็นเป้าหมายที่ต้องการเน้นแสดงผล
 */
export default function Show({ auth, post, highlightId }) {
    // ==========================================
    // 1. การจัดการสถานะและฟอร์ม (State & Form Management)
    // ==========================================

    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

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
    // 2. การซิงโครไนซ์ข้อมูล (Effects)
    // ==========================================

    useEffect(() => {
        const isLiked = post.likes?.some(like => like.user_id === auth.user.id) || false;
        setLocalIsLiked(isLiked);
        setLocalLikeCount(post.likes?.length || 0);
    }, [post.likes, auth.user.id]);

    // ==========================================
    // 3. ฟังก์ชันช่วยเหลือและการประมวลผลข้อมูล (Helpers & Data Processing)
    // ==========================================

    /**
     * @function containsHighlight
     * @description ค้นหาว่ามีความคิดเห็นที่ตรงกับ targetId ซ่อนอยู่หรือไม่ (Recursive Search)
     * 🌟 [Optimization] ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่เมื่อเรนเดอร์
     */
    const containsHighlight = useCallback((comment, targetId) => {
        if (comment.id === targetId) return true;
        if (comment.replies && comment.replies.length > 0) {
            return comment.replies.some(reply => containsHighlight(reply, targetId));
        }
        return false;
    }, []);

    /**
     * @constant {Array} sortedComments 
     * @description จัดเรียงความคิดเห็น ดึงรายการที่ถูกไฮไลต์ไว้ด้านบนสุด
     * 🌟 [Optimization] ใช้ useMemo เพื่อไม่ให้ระบบต้องจัดเรียงอาร์เรย์ใหม่ทุกครั้งที่ผู้ใช้พิมพ์ข้อความ
     */
    const sortedComments = useMemo(() => {
        return [...(post.comments || [])].sort((a, b) => {
            const aHasHighlight = containsHighlight(a, highlightId);
            const bHasHighlight = containsHighlight(b, highlightId);
            
            if (aHasHighlight && !bHasHighlight) return -1;
            if (!aHasHighlight && bHasHighlight) return 1;
            return 0;
        });
    }, [post.comments, highlightId, containsHighlight]);

    // ==========================================
    // 4. ฟังก์ชันจัดการเหตุการณ์ (Event Handlers)
    // ==========================================

    /**
     * @function handleLike
     * @description จัดการการกดถูกใจพร้อมอัปเดต UI ทันที (Optimistic UI)
     */
    const handleLike = useCallback(() => {
        const newIsLiked = !localIsLiked;
        setLocalIsLiked(newIsLiked);
        setLocalLikeCount(newIsLiked ? localLikeCount + 1 : localLikeCount - 1);

        router.post(route('posts.like', post.id), {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setLocalIsLiked(localIsLiked);
                setLocalLikeCount(localLikeCount);
            }
        });
    }, [localIsLiked, localLikeCount, post.id]);

    /**
     * @function handleCommentSubmit
     * @description จัดการการส่งฟอร์มความคิดเห็น (สร้างใหม่ หรือ แก้ไข)
     */
    const handleCommentSubmit = useCallback((e) => {
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
    }, [editingComment, patchComment, postComment, post.id, resetComment]);

    // ==========================================
    // 5. ส่วนแสดงผล (Render)
    // ==========================================

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">กระทู้ฉบับเต็ม ✨</h2>}>
            
            <Head>
                <title>{`Post: ${post.title}`}</title>
                <meta name="description" content={post.content.substring(0, 150) + '...'} />
            </Head>
            
            <main className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    <article aria-label="รายละเอียดโพสต์หลัก" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        
                        {/* --- ส่วนเนื้อหาหลักของโพสต์ --- */}
                        <header>
                            <h3 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h3>
                        </header>
                        <p className="text-gray-700 whitespace-pre-wrap mb-8 text-lg leading-relaxed">{post.content}</p>

                        {/* --- ส่วนแสดงแกลเลอรีรูปภาพ --- */}
                        {post.images && post.images.length > 0 && (
                            <section aria-label="แกลเลอรีรูปภาพ" className={`grid gap-2 mb-8 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {post.images.map((img, index) => (
                                    <img 
                                        key={img.id} 
                                        src={img.image_url} // 🌟 [Lighthouse] นำ ?t= ออกเพื่อประสิทธิภาพ Caching
                                        alt={`ภาพประกอบที่ ${index + 1} ของโพสต์: ${post.title}`} 
                                        loading="lazy" 
                                        decoding="async"
                                        // 🌟 [Lighthouse] ระบุขนาดอ้างอิงเพื่อป้องกัน Layout Shift (CLS)
                                        width="800"
                                        height="500"
                                        className="w-full rounded-2xl shadow-sm border object-cover max-h-[500px] bg-gray-100" 
                                    />
                                ))}
                            </section>
                        )}

                        {/* --- ส่วนแถบเครื่องมือปฏิสัมพันธ์ (Interaction Bar) --- */}
                        <div className="flex items-center py-4 border-y border-gray-100 mb-6">
                            <button 
                                onClick={handleLike} 
                                aria-label={localIsLiked ? "ยกเลิกถูกใจโพสต์นี้" : "ถูกใจโพสต์นี้"}
                                // 🌟 [Lighthouse] กำหนด min-h-[44px] ให้พื้นที่สัมผัสผ่านมาตรฐาน
                                className={`flex items-center gap-2 font-bold transition-all duration-300 p-2 -m-2 min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${ 
                                    localIsLiked ? 'text-rose-500 scale-105' : 'text-gray-500 hover:text-rose-400' 
                                }`}
                            >
                                <svg 
                                    className="w-6 h-6" 
                                    fill={localIsLiked ? "currentColor" : "none"} 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
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
                        <section aria-labelledby="comments-heading" className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <h4 id="comments-heading" className="text-xs font-bold text-gray-500 uppercase mb-6 tracking-widest">
                                ความคิดเห็น (Comments)
                            </h4> 
                            
                            <div className="space-y-3">
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
                                            if (window.confirm('คุณยืนยันที่จะลบความคิดเห็นนี้ใช่หรือไม่?')) {
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
                                    <div className="mb-3 flex justify-between items-center bg-indigo-50 pl-4 pr-2 py-2 rounded-xl text-sm text-indigo-700 font-medium border border-indigo-100">
                                        <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                                        <button 
                                            type="button"
                                            onClick={() => { setReplyingTo(null); resetComment(); }} 
                                            aria-label="ยกเลิกการตอบกลับ" 
                                            // 🌟 [Lighthouse] อัปเกรดเป็นปุ่มกากบาทแบบมีพื้นที่สัมผัสเหมาะสม
                                            className="text-indigo-400 hover:text-indigo-800 hover:bg-indigo-100 transition min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                )}

                                {/* แถบสถานะ: กำลังแก้ไข */}
                                {editingComment && (
                                    <div className="mb-3 flex justify-between items-center bg-amber-50 pl-4 pr-2 py-2 rounded-xl text-sm text-amber-700 font-medium border border-amber-100">
                                        <span>กำลังแก้ไขคอมเมนต์ของตัวเอง ✍️</span>
                                        <button 
                                            type="button"
                                            onClick={() => { setEditingComment(null); resetComment(); }} 
                                            aria-label="ยกเลิกการแก้ไข" 
                                            // 🌟 [Lighthouse] อัปเกรดปุ่มยกเลิก
                                            className="text-amber-500 hover:text-amber-800 hover:bg-amber-100 transition min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleCommentSubmit} className="flex flex-col sm:flex-row gap-3">
                                    <label htmlFor="post-comment-input" className="sr-only">
                                        {editingComment ? 'ฟอร์มแก้ไขความคิดเห็น' : 'ฟอร์มร่วมแสดงความคิดเห็น'}
                                    </label>
                                    <textarea 
                                        id="post-comment-input"
                                        value={commentForm.content} 
                                        onChange={e => setCommentForm('content', e.target.value)} 
                                        className="flex-1 rounded-xl border-gray-200 resize-y focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                        rows="2"
                                        placeholder="ร่วมแสดงความคิดเห็น..." 
                                    ></textarea>
                                    
                                    <button 
                                        type="submit"
                                        disabled={commentProcessing || !commentForm.content.trim()} 
                                        className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 min-h-[44px] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 self-end sm:self-stretch"
                                    >
                                        {editingComment ? 'บันทึกการแก้ไข' : 'ส่งข้อมูล'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </article>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
