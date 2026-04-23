import { useState, useRef, useEffect } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';
import Dropdown from '@/Components/Dropdown';

/**
 * Post Item Component
 * @description คอมโพเนนต์หลักสำหรับแสดงผลการ์ดโพสต์แต่ละรายการ
 * จัดการทั้งโหมดแสดงผล โหมดแก้ไขโพสต์ ระบบกดถูกใจ (Optimistic UI) และการจัดการสถานะฟอร์มคอมเมนต์ส่วนกลาง
 * @param {Object} props
 * @param {Object} props.post - ข้อมูลโพสต์ทั้งหมด รวมคอมเมนต์และการกดถูกใจ
 * @param {Object} props.auth - ข้อมูลผู้ใช้ที่เข้าสู่ระบบ
 * @param {number|string|null} props.highlightId - ID ของคอมเมนต์เป้าหมายเพื่อเน้นสี (ถ้ามี)
 * @returns {JSX.Element}
 */
export default function PostItem({ post, auth, highlightId = null }) {
    // ==========================================
    // State Management (Post)
    // ==========================================
    
    /** @type {[boolean, Function]} isEditingPost - ควบคุมการเปิด/ปิดโหมดแก้ไขโพสต์ */
    const [isEditingPost, setIsEditingPost] = useState(false);
    const editFileInputRef = useRef();

    /** @type {[number, Function]} visibleCommentsCount - จำนวนคอมเมนต์หลักที่จะแสดงผล (ปุ่มดูเพิ่มเติม) */
    const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

    // ==========================================
    // State Management (Optimistic UI - Likes)
    // ==========================================
    
    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

    // ซิงค์ข้อมูล Local เข้ากับข้อมูลจากเซิร์ฟเวอร์ทุกครั้งที่มีการอัปเดต
    useEffect(() => {
        setLocalIsLiked(post.likes?.some(like => like.user_id === auth.user.id) || false);
        setLocalLikeCount(post.likes?.length || 0);
    }, [post.likes, auth.user.id]);

    // ==========================================
    // Form & State Management (Comments)
    // ==========================================

    /** @type {[Object|null, Function]} replyingTo - สถานะเก็บข้อมูลคอมเมนต์ที่กำลังจะตอบกลับ */
    const [replyingTo, setReplyingTo] = useState(null);
    /** @type {[Object|null, Function]} editingComment - สถานะเก็บข้อมูลคอมเมนต์ที่กำลังจะแก้ไข */
    const [editingComment, setEditingComment] = useState(null);

    /** * @type {Object} commentForm - ฟอร์มส่วนกลางสำหรับคอมเมนต์ในโพสต์นี้ 
     * (จะถูกส่งต่อให้ CommentItem นำไปแสดงผลตรงจุดที่ต้องการ)
     */
    const { 
        data: commentForm, 
        setData: setCommentForm, 
        post: submitComment, 
        patch: patchComment, 
        reset: resetComment, 
        processing: commentProcessing 
    } = useForm({
        content: '',
        parent_id: null,
    });

    /** ฟอร์มสำหรับการแก้ไขเนื้อหาโพสต์ */
    const { 
        data: editPostData, 
        setData: setEditPostData, 
        post: submitEditPost, 
        processing: postEditProcessing 
    } = useForm({ 
        title: post.title, 
        content: post.content, 
        images: [], 
        _method: 'PUT' 
    });

    // ==========================================
    // Action Handlers
    // ==========================================

    /**
     * @function handleLike
     * @description จัดการการกดถูกใจโพสต์ (อัปเดต UI ทันทีก่อนรอเซิร์ฟเวอร์)
     */
    const handleLike = () => {
        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(localIsLiked ? localLikeCount - 1 : localLikeCount + 1);

        router.post(route('posts.like', post.id), {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                // หากเซิร์ฟเวอร์เกิดข้อผิดพลาด คืนค่าเดิม
                setLocalIsLiked(localIsLiked);
                setLocalLikeCount(localLikeCount);
            }
        });
    };

    /**
     * @function handleCommentSubmit
     * @description จัดการการส่งข้อมูลฟอร์มคอมเมนต์ (ทั้งแบบสร้างใหม่ ตอบกลับ และแก้ไข)
     * @param {React.FormEvent} e 
     */
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        
        if (editingComment) {
            // โหมดแก้ไขคอมเมนต์เดิม
            patchComment(route('comments.update', editingComment.id), { 
                onSuccess: () => { setEditingComment(null); resetComment(); }, 
                preserveScroll: true, 
                preserveState: true 
            });
        } else {
            // โหมดสร้างคอมเมนต์ใหม่ (ทั้งแบบหลักและแบบตอบกลับ)
            submitComment(route('comments.store', post.id), { 
                onSuccess: () => { setReplyingTo(null); resetComment(); }, 
                preserveScroll: true, 
                preserveState: true 
            });
        }
    };

    const handleEditPostSubmit = (e) => {
        e.preventDefault();
        submitEditPost(route('posts.update', post.id), {
            preserveScroll: true, 
            preserveState: true,
            onSuccess: () => setIsEditingPost(false),
        });
    };

    const handleDeletePost = () => {
        if (confirm('แน่ใจหรือไม่ว่าจะลบโพสต์นี้?')) {
            router.delete(route('posts.destroy', post.id), { preserveScroll: true, preserveState: true });
        }
    };

    /** คัดกรองและแบ่งจำนวนคอมเมนต์ที่แสดงผล */
    const mainComments = post.comments?.filter(c => !c.parent_id) || [];
    const displayComments = mainComments.slice(0, visibleCommentsCount);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {/* --- ส่วนหัวของโพสต์ (Header) --- */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {/* ปรับให้โชว์รูปโปรไฟล์จริง */}
                    {post.user.avatar_url ? (
                        <img src={`${post.user.avatar_url}?t=${new Date().getTime()}`} className="h-10 w-10 rounded-full object-cover border border-gray-100" />
                    ) : (
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                            {post.user.name[0]}
                        </div>
                    )}
                    <div>
                        <Link href={route('profile.show', post.user.id)} className="font-bold text-gray-900 hover:text-indigo-600 transition">
                            {post.user.name}
                        </Link>
                        <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('th-TH')}</div>
                    </div>
                </div>

                {/* เมนูจัดการโพสต์ (แสดงเฉพาะเจ้าของ) */}
                {post.user_id === auth.user.id && !isEditingPost && (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="text-gray-400 hover:text-indigo-600 transition p-2">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <button onClick={() => setIsEditingPost(true)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 font-medium">แก้ไขโพสต์</button>
                            <button onClick={handleDeletePost} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-rose-500 font-bold">ลบโพสต์</button>
                        </Dropdown.Content>
                    </Dropdown>
                )}
            </div>
            
            {/* --- ส่วนเนื้อหาโพสต์ (Body) --- */}
            {isEditingPost ? (
                // โหมดแก้ไข
                <form onSubmit={handleEditPostSubmit} className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <input type="text" value={editPostData.title} onChange={e => setEditPostData('title', e.target.value)} className="w-full border-gray-300 rounded-lg mb-3 focus:ring-indigo-500 text-lg font-bold" placeholder="หัวข้อโพสต์..." />
                    <textarea value={editPostData.content} onChange={e => setEditPostData('content', e.target.value)} className="w-full border-gray-300 rounded-lg h-32 mb-3 focus:ring-indigo-500" placeholder="เนื้อหา..."></textarea>
                    
                    <div className="flex items-center justify-between mt-2">
                        <input type="file" ref={editFileInputRef} onChange={e => setEditPostData('images', Array.from(e.target.files))} className="text-xs text-gray-500" multiple />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => { setIsEditingPost(false); setEditPostData({ title: post.title, content: post.content, images: [], _method: 'PUT' }); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300 transition">ยกเลิก</button>
                            <button type="submit" disabled={postEditProcessing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm">บันทึก</button>
                        </div>
                    </div>
                </form>
            ) : (
                // โหมดอ่าน
                <>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post.images.map(img => (
                                <img key={img.id} src={`${img.image_url}?t=${new Date().getTime()}`} alt="content" className="w-full rounded-xl shadow-sm border object-contain bg-gray-50 max-h-[400px]"/>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* --- แถบปุ่มถูกใจ --- */}
            {!isEditingPost && (
                <div className="flex items-center py-3 border-y border-gray-100 mb-2">
                    <button 
                        onClick={handleLike} 
                        className={`flex items-center gap-2 font-bold transition-all duration-300 ${localIsLiked ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-rose-400'}`}
                    >
                        <svg className="w-6 h-6" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <span>{localLikeCount > 0 ? `${localLikeCount} ถูกใจ` : 'ถูกใจ'}</span>
                    </button>
                </div>
            )}

            {/* --- ส่วนแสดงความคิดเห็น (Comment Section) --- */}
            <div className="bg-gray-50 rounded-xl p-5 mt-4 border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Comments ({mainComments.length})</h4>
                
                <div className="space-y-1">
                    {displayComments.map(comment => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            auth={auth} 
                            highlightId={highlightId} 
                            
                            // ส่งต่อสถานะและฟังก์ชันทั้งหมดของฟอร์มให้ Component ลูก 
                            replyingTo={replyingTo}
                            editingComment={editingComment}
                            commentForm={commentForm}
                            setCommentForm={setCommentForm}
                            commentProcessing={commentProcessing}
                            onCommentSubmit={handleCommentSubmit}
                            
                            // ฟังก์ชันเคลียร์ฟอร์มส่วนกลาง
                            onCancel={() => { 
                                setReplyingTo(null); 
                                setEditingComment(null); 
                                resetComment(); 
                            }}
                            
                            // จัดการการเกิด Action ต่างๆ
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
                                if (confirm('แน่ใจหรือไม่ว่าจะลบคอมเมนต์นี้?')) {
                                    router.delete(route('comments.destroy', id), { preserveScroll: true, preserveState: true });
                                }
                            }} 
                        />
                    ))}
                </div>

                {/* ปุ่มโหลดคอมเมนต์เพิ่มเติม */}
                {mainComments.length > visibleCommentsCount && (
                    <button onClick={() => setVisibleCommentsCount(v => v + 5)} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">
                        ดูคอมเมนต์เพิ่มเติม...
                    </button>
                )}

                {/* ✨ ฟอร์มคอมเมนต์หลัก (Main Comment Form)
                    * จะแสดงผลต่อเมื่อ "ไม่ได้" กดตอบกลับหรือแก้ไขคอมเมนต์ไหนเลย
                */}
                {!replyingTo && !editingComment && (
                    <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200 flex gap-2 items-end">
                        <textarea 
                            value={commentForm.content} 
                            onChange={e => setCommentForm('content', e.target.value)} 
                            placeholder="เพิ่มความคิดเห็นของคุณ..." 
                            rows="2" 
                            className="flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-y"
                        ></textarea>
                        <button 
                            disabled={commentProcessing || !commentForm.content.trim()} 
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition hover:bg-indigo-700 h-fit disabled:opacity-50"
                        >
                            ส่ง
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}