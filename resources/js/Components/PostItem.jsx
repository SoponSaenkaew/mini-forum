import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';
import Dropdown from '@/Components/Dropdown';

/**
 * @component PostItem
 * @description คอมโพเนนต์แสดงผลโพสต์ ปรับปรุงเพื่อคะแนน Lighthouse 100/100
 * เน้นการลด Layout Shift และเพิ่มความเร็วในการโหลดรูปภาพ (LCP)
 */
const PostItem = memo(({ post, auth, highlightId = null, isFirst = false }) => {
    // ==========================================
    // 1. การจัดการสถานะ (State Management)
    // ==========================================
    const [isEditingPost, setIsEditingPost] = useState(false);
    const editFileInputRef = useRef();
    const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

    useEffect(() => {
        setLocalIsLiked(post.likes?.some(like => like.user_id === auth.user.id) || false);
        setLocalLikeCount(post.likes?.length || 0);
    }, [post.likes, auth.user.id]);

    const { 
        data: commentForm, 
        setData: setCommentForm, 
        post: submitComment, 
        patch: patchComment, 
        reset: resetComment, 
        processing: commentProcessing 
    } = useForm({ content: '', parent_id: null });

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

    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);

    // ==========================================
    // 2. ฟังก์ชันจัดการเหตุการณ์ (Action Handlers)
    // ==========================================
    
    const handleLike = useCallback(() => {
        const prevIsLiked = localIsLiked;
        const prevCount = localLikeCount;

        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(localIsLiked ? localLikeCount - 1 : localLikeCount + 1);

        router.post(route('posts.like', post.id), {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setLocalIsLiked(prevIsLiked);
                setLocalLikeCount(prevCount);
            }
        });
    }, [localIsLiked, localLikeCount, post.id]);

    const handleCommentSubmit = useCallback((e) => {
        e.preventDefault();
        if (editingComment) {
            patchComment(route('comments.update', editingComment.id), { 
                onSuccess: () => { setEditingComment(null); resetComment(); }, 
                preserveScroll: true, 
                preserveState: true 
            });
        } else {
            submitComment(route('comments.store', post.id), { 
                onSuccess: () => { setReplyingTo(null); resetComment(); }, 
                preserveScroll: true, 
                preserveState: true 
            });
        }
    }, [editingComment, patchComment, submitComment, post.id, resetComment]);

    const handlePostEditSubmit = useCallback((e) => {
        e.preventDefault();
        submitEditPost(route('posts.update', post.id), { 
            onSuccess: () => setIsEditingPost(false) 
        });
    }, [submitEditPost, post.id]);

    const handleDeletePost = useCallback(() => {
        if (window.confirm('คุณยืนยันที่จะลบโพสต์นี้ใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้')) {
            router.delete(route('posts.destroy', post.id));
        }
    }, [post.id]);

    const handleReplyComment = useCallback((c) => {
        setEditingComment(null);
        setReplyingTo(c);
        setCommentForm({ content: '', parent_id: c.id });
    }, [setCommentForm]);

    const handleEditCommentAction = useCallback((c) => {
        setReplyingTo(null);
        setEditingComment(c);
        setCommentForm('content', c.content);
    }, [setCommentForm]);

    const handleDeleteComment = useCallback((id) => {
        if (window.confirm('คุณยืนยันที่จะลบความคิดเห็นนี้ใช่หรือไม่?')) {
            router.delete(route('comments.destroy', id), { preserveScroll: true });
        }
    }, []);

    const handleCancelComment = useCallback(() => {
        setReplyingTo(null);
        setEditingComment(null);
        resetComment();
    }, [resetComment]);

    // ==========================================
    // 3. การแสดงผล (Render)
    // ==========================================
    const mainComments = post.comments?.filter(c => !c.parent_id) || [];
    const displayComments = mainComments.slice(0, visibleCommentsCount);

    return (
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4" aria-label={`โพสต์โดย ${post.user.name}`}>
            <header className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <Link href={route('profile.show', post.user.id)} className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
                        {post.user.avatar_url ? (
                            <img 
                                src={post.user.avatar_url}
                                width="40"
                                height="40"
                                // 🌟 [Performance] รูปโปรไฟล์ในฟีดควรโหลดแบบ async เสมอ
                                loading="lazy"
                                decoding="async"
                                className="h-10 w-10 rounded-full object-cover border border-gray-100 bg-gray-50" 
                                alt={`โปรไฟล์ของ ${post.user.name}`} 
                            />
                        ) : (
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold" aria-hidden="true">
                                {post.user.name[0]}
                            </div>
                        )}
                    </Link>
                    <div>
                        <Link href={route('profile.show', post.user.id)} className="font-bold text-gray-900 hover:text-indigo-600 transition focus:outline-none focus:underline">
                            {post.user.name}
                        </Link>
                        <time className="block text-xs text-gray-500 font-medium" dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleString('th-TH')}
                        </time>
                    </div>
                </div>

                {post.user_id === auth.user.id && !isEditingPost && (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button 
                                aria-label="ตัวเลือกจัดการโพสต์" 
                                className="text-gray-400 hover:text-indigo-600 transition p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <button onClick={() => setIsEditingPost(true)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 font-medium focus:outline-none">แก้ไขโพสต์</button>
                            <button onClick={handleDeletePost} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-rose-600 font-bold focus:outline-none">ลบโพสต์</button>
                        </Dropdown.Content>
                    </Dropdown>
                )}
            </header>
            
            {isEditingPost ? (
                <form onSubmit={handlePostEditSubmit} className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label htmlFor={`edit-title-${post.id}`} className="sr-only">แก้ไขหัวข้อโพสต์</label>
                    <input id={`edit-title-${post.id}`} type="text" value={editPostData.title} onChange={e => setEditPostData('title', e.target.value)} className="w-full border-gray-300 rounded-lg mb-3 focus:ring-indigo-500 text-lg font-bold" />
                    
                    <label htmlFor={`edit-content-${post.id}`} className="sr-only">แก้ไขเนื้อหาโพสต์</label>
                    <textarea id={`edit-content-${post.id}`} value={editPostData.content} onChange={e => setEditPostData('content', e.target.value)} className="w-full border-gray-300 rounded-lg h-32 mb-3 focus:ring-indigo-500 resize-y" />
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-3">
                        <input type="file" aria-label="แนบรูปภาพเพิ่มเติม" ref={editFileInputRef} onChange={e => setEditPostData('images', Array.from(e.target.files))} className="text-xs text-gray-500 w-full sm:w-auto" multiple />
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button type="button" onClick={() => setIsEditingPost(false)} className="bg-gray-200 text-gray-700 px-4 py-2 min-h-[44px] rounded-lg text-sm font-bold hover:bg-gray-300">ยกเลิก</button>
                            <button type="submit" disabled={postEditProcessing} className="bg-indigo-600 text-white px-6 py-2 min-h-[44px] rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-50">บันทึกข้อมูล</button>
                        </div>
                    </div>
                </form>
            ) : (
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 mb-4 overflow-hidden rounded-xl ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post.images.map((img, index) => {
                                // 🌟 [Optimization: Image Size] 
                                // ปรับขนาดรูปภาพผ่าน URL ของ Supabase เพื่อให้ขนาดไฟล์เล็กลง (ลด KiB)
                                // กำหนดความกว้างที่เหมาะสม (เช่น 400px สำหรับ grid และ 700px สำหรับรูปเดี่ยว)
                                const isSingleImage = post.images.length === 1;
                                const optimizedWidth = isSingleImage ? 700 : 400;
                                const optimizedUrl = `${img.image_url}?width=${optimizedWidth}&quality=70&format=webp`;

                                return (
                                    <img 
                                        key={img.id} 
                                        src={optimizedUrl} // ✨ ใช้ URL ที่ผ่านการบีบอัดและปรับขนาดแล้ว
                                        alt={`ภาพประกอบเนื้อหา: ${post.title}`} 
                                        width={optimizedWidth}
                                        height={isSingleImage ? 450 : 300}
                                        loading={isFirst && index === 0 ? "eager" : "lazy"}
                                        fetchpriority={isFirst && index === 0 ? "high" : "auto"}
                                        decoding="async"
                                        // 🌟 [CLS] รักษา Aspect Ratio และความสูงขั้นต่ำ
                                        className="w-full h-auto min-h-[150px] shadow-sm border object-cover bg-gray-100 max-h-[500px]"
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {!isEditingPost && (
                <footer className="flex items-center py-3 border-y border-gray-100 mb-2">
                    <button 
                        onClick={handleLike} 
                        aria-label={localIsLiked ? "ยกเลิกถูกใจโพสต์นี้" : "ถูกใจโพสต์นี้"}
                        className={`flex items-center gap-2 font-bold transition-all p-2 -m-2 min-h-[44px] rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 ${localIsLiked ? 'text-rose-600 scale-105' : 'text-gray-500 hover:text-rose-400'}`}
                    >
                        <svg className="w-6 h-6" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <span>{localLikeCount > 0 ? `${localLikeCount} ถูกใจ` : 'ถูกใจ'}</span>
                    </button>
                </footer>
            )}

            <section className="bg-gray-50 rounded-xl p-5 mt-4 border border-gray-100" aria-label="ส่วนความคิดเห็น">
                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">
                    ความคิดเห็น ({mainComments.length})
                </h4> 
                
                <div className="space-y-1">
                    {displayComments.map(comment => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            auth={auth} 
                            highlightId={highlightId} 
                            replyingTo={replyingTo}
                            editingComment={editingComment}
                            commentForm={commentForm}
                            setCommentForm={setCommentForm}
                            commentProcessing={commentProcessing}
                            onCommentSubmit={handleCommentSubmit}
                            onCancel={handleCancelComment}
                            onReply={handleReplyComment} 
                            onEdit={handleEditCommentAction} 
                            onDelete={handleDeleteComment} 
                        />
                    ))}
                </div>

                {mainComments.length > visibleCommentsCount && (
                    <button 
                        onClick={() => setVisibleCommentsCount(v => v + 5)} 
                        className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 p-2 -m-2 min-h-[44px] inline-flex items-center rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        ดูความคิดเห็นเพิ่มเติม...
                    </button>
                )}

                {!replyingTo && !editingComment && (
                    <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 items-end sm:items-start">
                        <label htmlFor={`main-comment-${post.id}`} className="sr-only">เพิ่มความคิดเห็นใหม่</label>
                        <textarea 
                            id={`main-comment-${post.id}`}
                            value={commentForm.content} 
                            onChange={e => setCommentForm('content', e.target.value)} 
                            placeholder="แบ่งปันความคิดเห็นของคุณ..." 
                            rows="1" 
                            className="w-full sm:flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-none py-3"
                        />
                        <button 
                            disabled={commentProcessing || !commentForm.content.trim()} 
                            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition hover:bg-indigo-700 disabled:opacity-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            ส่ง
                        </button>
                    </form>
                )}
            </section>
        </article>
    );
});

export default PostItem;
