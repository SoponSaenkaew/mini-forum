import { useState, useRef, useEffect, memo } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';
import Dropdown from '@/Components/Dropdown';

/**
 * @component PostItem
 * @description คอมโพเนนต์หลักสำหรับแสดงผลการ์ดโพสต์ ปรับปรุงเพื่อประสิทธิภาพ (Memo) 
 * และความสามารถในการเข้าถึง (Accessibility)
 */
const PostItem = memo(({ post, auth, highlightId = null }) => {
    // ==========================================
    // 1. State Management
    // ==========================================
    const [isEditingPost, setIsEditingPost] = useState(false);
    const editFileInputRef = useRef();
    const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

    // Optimistic UI States
    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

    useEffect(() => {
        setLocalIsLiked(post.likes?.some(like => like.user_id === auth.user.id) || false);
        setLocalLikeCount(post.likes?.length || 0);
    }, [post.likes, auth.user.id]);

    // Forms Management
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
    // 2. Action Handlers
    // ==========================================
    const handleLike = () => {
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
    };

    const handleCommentSubmit = (e) => {
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
    };

    // ==========================================
    // 3. Render
    // ==========================================
    const mainComments = post.comments?.filter(c => !c.parent_id) || [];
    const displayComments = mainComments.slice(0, visibleCommentsCount);

    return (
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4" aria-label={`โพสต์โดย ${post.user.name}`}>
            {/* Header Section */}
            <header className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {post.user.avatar_url ? (
                        <img 
                            src={`${post.user.avatar_url}?t=${new Date().getTime()}`} 
                            className="h-10 w-10 rounded-full object-cover border border-gray-100" 
                            alt={`รูปโปรไฟล์ของ ${post.user.name}`} // [Optimization] เพิ่ม Alt Text
                        />
                    ) : (
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold" aria-hidden="true">
                            {post.user.name[0]}
                        </div>
                    )}
                    <div>
                        <Link href={route('profile.show', post.user.id)} className="font-bold text-gray-900 hover:text-indigo-600 transition focus:outline-none focus:underline">
                            {post.user.name}
                        </Link>
                        <time className="block text-xs text-gray-500 font-medium" dateTime={post.created_at}> {/* [Optimization] ปรับความเข้มสีและใช้ <time> */}
                            {new Date(post.created_at).toLocaleString('th-TH')}
                        </time>
                    </div>
                </div>

                {post.user_id === auth.user.id && !isEditingPost && (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button 
                                aria-label="ตัวเลือกจัดการโพสต์" // [Optimization] Accessible Name
                                className="text-gray-400 hover:text-indigo-600 transition p-2 -m-2"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <button onClick={() => setIsEditingPost(true)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 font-medium">แก้ไขโพสต์</button>
                            <button onClick={() => { if(confirm('ลบโพสต์?')) router.delete(route('posts.destroy', post.id)); }} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-rose-600 font-bold">ลบโพสต์</button>
                        </Dropdown.Content>
                    </Dropdown>
                )}
            </header>
            
            {/* Body Section */}
            {isEditingPost ? (
                <form onSubmit={(e) => { e.preventDefault(); submitEditPost(route('posts.update', post.id), { onSuccess: () => setIsEditingPost(false) }); }} className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label htmlFor={`edit-title-${post.id}`} className="sr-only">หัวข้อโพสต์</label>
                    <input id={`edit-title-${post.id}`} type="text" value={editPostData.title} onChange={e => setEditPostData('title', e.target.value)} className="w-full border-gray-300 rounded-lg mb-3 focus:ring-indigo-500 text-lg font-bold" />
                    
                    <label htmlFor={`edit-content-${post.id}`} className="sr-only">เนื้อหาโพสต์</label>
                    <textarea id={`edit-content-${post.id}`} value={editPostData.content} onChange={e => setEditPostData('content', e.target.value)} className="w-full border-gray-300 rounded-lg h-32 mb-3 focus:ring-indigo-500" />
                    
                    <div className="flex items-center justify-between mt-2">
                        <input type="file" aria-label="แนบรูปภาพ" ref={editFileInputRef} onChange={e => setEditPostData('images', Array.from(e.target.files))} className="text-xs text-gray-500" multiple />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsEditingPost(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300">ยกเลิก</button>
                            <button type="submit" disabled={postEditProcessing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">บันทึก</button>
                        </div>
                    </div>
                </form>
            ) : (
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post.images.map(img => (
                                <img 
                                    key={img.id} 
                                    src={`${img.image_url}?t=${new Date().getTime()}`} 
                                    alt={`รูปภาพประกอบจากโพสต์: ${post.title}`} // [Optimization] เพิ่ม Alt Text
                                    className="w-full rounded-xl shadow-sm border object-contain bg-gray-50 max-h-[400px]"
                                    loading="lazy" // [Optimization] Performance
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Interaction Footer */}
            {!isEditingPost && (
                <footer className="flex items-center py-3 border-y border-gray-100 mb-2">
                    <button 
                        onClick={handleLike} 
                        aria-label={localIsLiked ? "เลิกถูกใจโพสต์นี้" : "ถูกใจโพสต์นี้"}
                        className={`flex items-center gap-2 font-bold transition-all p-2 -m-2 ${localIsLiked ? 'text-rose-600 scale-105' : 'text-gray-500 hover:text-rose-400'}`}
                    >
                        <svg className="w-6 h-6" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <span>{localLikeCount > 0 ? `${localLikeCount} ถูกใจ` : 'ถูกใจ'}</span>
                    </button>
                </footer>
            )}

            {/* Comment Section */}
            <section className="bg-gray-50 rounded-xl p-5 mt-4 border border-gray-100" aria-label="ความคิดเห็น">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4"> {/* [Optimization] ปรับความเข้มสี */}
                    Comments ({mainComments.length})
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
                            onCancel={() => { setReplyingTo(null); setEditingComment(null); resetComment(); }}
                            onReply={(c) => { setEditingComment(null); setReplyingTo(c); setCommentForm({ content: '', parent_id: c.id }); }} 
                            onEdit={(c) => { setReplyingTo(null); setEditingComment(c); setCommentForm('content', c.content); }} 
                            onDelete={(id) => { if (confirm('ลบคอมเมนต์?')) router.delete(route('comments.destroy', id), { preserveScroll: true }); }} 
                        />
                    ))}
                </div>

                {mainComments.length > visibleCommentsCount && (
                    <button onClick={() => setVisibleCommentsCount(v => v + 5)} className="mt-4 text-xs font-bold text-indigo-600 hover:underline p-2 -m-2">
                        ดูคอมเมนต์เพิ่มเติม...
                    </button>
                )}

                {!replyingTo && !editingComment && (
                    <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200 flex gap-2 items-end">
                        <label htmlFor={`main-comment-${post.id}`} className="sr-only">เพิ่มความคิดเห็น</label>
                        <textarea 
                            id={`main-comment-${post.id}`}
                            value={commentForm.content} 
                            onChange={e => setCommentForm('content', e.target.value)} 
                            placeholder="เพิ่มความคิดเห็นของคุณ..." 
                            rows="2" 
                            className="flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-y"
                        />
                        <button 
                            disabled={commentProcessing || !commentForm.content.trim()} 
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition hover:bg-indigo-700 h-fit disabled:opacity-50 shadow-sm"
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
