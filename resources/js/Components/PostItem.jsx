import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';
import Dropdown from '@/Components/Dropdown';

/**
 * @component PostItem
 * @description คอมโพเนนต์หลักสำหรับแสดงผลโพสต์ รองรับการย่อข้อความยาวๆ, การแก้ไขโดยใช้ HTML Tag โดยตรง และการจัดการคอมเมนต์
 */
const PostItem = memo(({ post, auth, highlightId = null, isFirst = false }) => {
    // 🛡️ ป้องกันกรณีข้อมูล post ไม่ถูกส่งมา
    if (!post) return null;

    // --- 1. States & Refs ---
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // ควบคุมการแสดงเนื้อหา (Read More)
    const [visibleCommentsCount, setVisibleCommentsCount] = useState(1);
    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const editFileInputRef = useRef();

    // ค่าคงที่สำหรับระบบย่อข้อความ
    const TEXT_LIMIT = 400; 

    // --- 2. Forms (Inertia useForm) ---
    const { 
        data: commentForm, setData: setCommentForm, post: submitComment, 
        patch: patchComment, reset: resetComment, processing: commentProcessing 
    } = useForm({ content: '', parent_id: null });

    const { 
        data: editPostData, setData: setEditPostData, post: submitEditPost, 
        processing: postEditProcessing 
    } = useForm({ 
        title: post?.title || '', 
        content: post?.content || '', 
        images: [], 
        _method: 'PUT' 
    });

    // --- 3. Effects ---
    useEffect(() => {
        setLocalIsLiked(post?.likes?.some(like => like?.user_id === auth?.user?.id) || false);
        setLocalLikeCount(post?.likes?.length || 0);
    }, [post?.likes, auth?.user?.id]);

    // --- 4. Handlers (Logic การทำงาน) ---

    /** จัดการระบบถูกใจแบบ Optimistic Update */
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

    /** จัดการส่งฟอร์มความคิดเห็น (ทั้งสร้างใหม่และแก้ไข) */
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

    /** บันทึกการแก้ไขโพสต์ */
    const handlePostEditSubmit = useCallback((e) => {
        e.preventDefault();
        submitEditPost(route('posts.update', post.id), { 
            onSuccess: () => setIsEditingPost(false) ,
            preserveScroll: true, 
            preserveState: true 
        });
    }, [submitEditPost, post.id]);

    /** ลบโพสต์ */
    const handleDeletePost = useCallback(() => {
        if (window.confirm('คุณยืนยันที่จะลบโพสต์นี้ใช่หรือไม่?')) {
            router.delete(route('posts.destroy', post.id));
        }
    }, [post.id]);

    // Handlers สำหรับ Comment Management
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

    // --- 5. Data Processing (ระบบย่อข้อความ) ---
    const getPlainText = (htmlContent) => {
        if (!htmlContent) return "";
        return htmlContent
            .replace(/<\/p>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>?/gm, '')
            .trim();
    };

    const plainTextLength = useMemo(() => getPlainText(post.content).length, [post.content]);

    const truncatedContent = useMemo(() => {
        const plainText = getPlainText(post.content);
        if (plainText.length <= TEXT_LIMIT || isExpanded) return post.content;
        return plainText.substring(0, TEXT_LIMIT) + '...';
    }, [post.content, isExpanded]);

    const allComments = Array.isArray(post?.comments) ? post.comments : Object.values(post?.comments || {});
    const mainComments = allComments.filter(c => !c.parent_id) || [];
    const displayComments = mainComments.slice(0, visibleCommentsCount);

    // --- 6. Render ---
    return (
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4" aria-label={`โพสต์โดย ${post?.user?.name}`}>
            <header className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <Link href={post?.user?.id ? route('profile.show', post.user.id) : '#'} className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
                        {post?.user?.avatar_url ? (
                            <img 
                                src={post?.user?.avatar_url}
                                width="40" height="40" loading="lazy"
                                className="h-10 w-10 rounded-full object-cover border border-gray-100 bg-gray-50" 
                                alt={`โปรไฟล์ของ ${post?.user?.name}`} 
                            />
                        ) : (
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                {post?.user?.name?.[0] || '?'}
                            </div>
                        )}
                    </Link>
                    <div>
                        <Link href={post?.user?.id ? route('profile.show', post.user.id) : '#'} className="font-bold text-gray-900 hover:text-indigo-600 transition">
                            {post?.user?.name || 'Unknown User'}
                        </Link>
                        <time className="block text-xs text-gray-500 font-medium">
                            {post?.created_at ? new Date(post.created_at).toLocaleString('th-TH') : ''}
                        </time>
                    </div>
                </div>

                {post?.user_id === auth?.user?.id && !isEditingPost && (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="text-gray-400 hover:text-indigo-600 transition p-2 rounded-md focus:outline-none">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <button onClick={() => setIsEditingPost(true)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 font-medium">แก้ไขโพสต์</button>
                            <button onClick={handleDeletePost} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-rose-600 font-bold">ลบโพสต์</button>
                        </Dropdown.Content>
                    </Dropdown>
                )}
            </header>
            
            {isEditingPost ? (
                /* 🎨 ฟอร์มแก้ไขที่หน้าตาเดียวกับฟอร์มสร้าง (Dashboard) โดยใช้ Input ปกติ ไม่ใช้ ReactQuill */
                <form onSubmit={handlePostEditSubmit} className="space-y-4 mb-6">
                    <div>
                        <label htmlFor={`edit-post-title-${post.id}`} className="sr-only">หัวข้อโพสต์</label>
                        <input 
                            id={`edit-post-title-${post.id}`}
                            type="text" 
                            value={editPostData.title} 
                            onChange={e => setEditPostData('title', e.target.value)} 
                            maxLength={100}
                            placeholder="ระบุหัวข้อโพสต์ของคุณ..."
                            className="w-full border-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" 
                        />
                    </div>
                    
                    <div className="w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <label htmlFor={`edit-post-content-${post.id}`} className="sr-only">เนื้อหาโพสต์</label>
                        <textarea 
                            id={`edit-post-content-${post.id}`}
                            value={editPostData.content} 
                            onChange={e => setEditPostData('content', e.target.value)} 
                            placeholder="ระบุเนื้อหาที่คุณต้องการแบ่งปัน (รองรับการเขียน HTML Tag)..."
                            className="w-full border-none bg-gray-50 rounded-xl h-48 focus:ring-2 focus:ring-indigo-500 resize-y p-4" 
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-50 pt-4 mt-2 gap-4">
                        <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm font-semibold p-2 -ml-2 rounded-lg hover:bg-indigo-50 transition focus-within:ring-2 focus-within:ring-indigo-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            เปลี่ยนรูปภาพ
                            <input type="file" multiple className="sr-only" ref={editFileInputRef} onChange={e => setEditPostData('images', Array.from(e.target.files))} accept="image/*" />
                        </label>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                type="button" 
                                onClick={() => setIsEditingPost(false)} 
                                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                type="submit" 
                                disabled={postEditProcessing} 
                                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-bold transition shadow-lg shadow-indigo-100 disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {postEditProcessing ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post?.title}</h3>
                    
                    {/* 🔍 ส่วนแสดงผล: ใช้คลาส prose เพื่อให้ HTML ที่พิมพ์แสดงผลได้อย่างสวยงาม */}
                    <div className="text-gray-800 mb-4">
                        {isExpanded || plainTextLength <= TEXT_LIMIT ? (
                            <div 
                                className="prose max-w-none prose-indigo prose-p:leading-relaxed prose-li:my-0" 
                                dangerouslySetInnerHTML={{ __html: post.content }} 
                            />
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{truncatedContent}</p>
                        )}

                        {plainTextLength > TEXT_LIMIT && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 text-indigo-600 font-bold hover:text-indigo-800 focus:outline-none"
                            >
                                {isExpanded ? 'แสดงน้อยลง' : '...อ่านเพิ่มเติม'}
                            </button>
                        )}
                    </div>
                    
                    {post?.images?.length > 0 && (
                        <div className={`grid gap-2 mb-4 overflow-hidden rounded-xl ${post?.images?.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post?.images?.map((img) => (
                                <img 
                                    key={img.id} 
                                    src={`${img.image_url}?width=600&quality=80`} 
                                    alt="Post content" 
                                    className="w-full h-auto object-cover bg-gray-100 max-h-[500px]"
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {!isEditingPost && (
                <footer className="flex items-center py-3 border-y border-gray-100 mb-2">
                    <button 
                        onClick={handleLike} 
                        className={`flex items-center gap-2 font-bold transition-all p-2 rounded-md ${localIsLiked ? 'text-rose-600' : 'text-gray-500'}`}
                    >
                        <svg className="w-6 h-6" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <span>{localLikeCount > 0 ? `${localLikeCount} ถูกใจ` : 'ถูกใจ'}</span>
                    </button>
                </footer>
            )}

            {/* --- ส่วนของความคิดเห็น (Comments) --- */}
            <section className="bg-gray-50 rounded-xl p-5 mt-4 border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-600 uppercase mb-4">ความคิดเห็น ({mainComments.length})</h4> 
                <div className="space-y-1">
                    {displayComments.map(comment => (
                        <CommentItem 
                            key={comment?.id} comment={comment} auth={auth} 
                            highlightId={highlightId} replyingTo={replyingTo} editingComment={editingComment}
                            commentForm={commentForm} setCommentForm={setCommentForm}
                            commentProcessing={commentProcessing} onCommentSubmit={handleCommentSubmit}
                            onCancel={handleCancelComment} onReply={handleReplyComment} 
                            onEdit={handleEditCommentAction} onDelete={handleDeleteComment} 
                        />
                    ))}
                </div>

                {mainComments.length > visibleCommentsCount && (
                    <button onClick={() => setVisibleCommentsCount(v => v + 5)} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">ดูเพิ่มเติม...</button>
                )}

                {!replyingTo && !editingComment && (
                    <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                        <textarea 
                            value={commentForm.content} 
                            onChange={e => setCommentForm('content', e.target.value)} 
                            placeholder="แบ่งปันความคิดเห็น..." rows="1" 
                            className="w-full border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-none py-3 px-4"
                        />
                        <button disabled={commentProcessing || !commentForm.content.trim()} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">ส่ง</button>
                    </form>
                )}
            </section>
        </article>
    );
});

export default PostItem;