import { useState, useRef } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';
import Dropdown from '@/Components/Dropdown';

export default function PostItem({ post, auth, highlightId = null }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

    // ✨ State สำหรับโหมดแก้ไขโพสต์
    const [isEditingPost, setIsEditingPost] = useState(false);
    const editFileInputRef = useRef();

    const { data: commentForm, setData: setCommentForm, post: postComment, patch: patchComment, reset: resetComment, processing: commentProcessing } = useForm({
        content: '',
        parent_id: null,
    });

    // ✨ Form สำหรับแก้ไขโพสต์ (ใช้ _method: 'PUT' เพื่อรองรับการอัปโหลดไฟล์ใน Laravel)
    const { data: editPostData, setData: setEditPostData, post: submitEditPost, processing: postEditProcessing } = useForm({
        title: post.title,
        content: post.content,
        image: [],
        _method: 'PUT',
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (editingComment) {
            patchComment(route('comments.update', editingComment.id), { onSuccess: () => { setEditingComment(null); resetComment(); }, preserveScroll: true });
        } else {
            postComment(route('comments.store', post.id), { onSuccess: () => { setReplyingTo(null); resetComment(); }, preserveScroll: true });
        }
    };

    // ✨ ฟังก์ชันจัดการโพสต์ (บันทึกแก้ไข & ลบ)
    const handleEditPostSubmit = (e) => {
        e.preventDefault();
        submitEditPost(route('posts.update', post.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditingPost(false),
        });
    };

    const handleDeletePost = () => {
        if (confirm('แน่ใจนะคะว่าจะลบโพสต์นี้? ลบแล้วกู้คืนไม่ได้น้า~ 🥺')) {
            router.delete(route('posts.destroy', post.id), { preserveScroll: true });
        }
    };

    const mainComments = post.comments?.filter(c => !c.parent_id) || [];
    const displayComments = mainComments.slice(0, visibleCommentsCount);

    const isLiked = post.likes?.some(like => like.user_id === auth.user.id);
    const likeCount = post.likes?.length || 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {/* Header ของโพสต์ */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{post.user.name[0]}</div>
                    <div>
                        <Link href={route('profile.show', post.user.id)} className="font-bold text-gray-900 hover:text-indigo-600 transition">{post.user.name}</Link>
                        <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('th-TH')}</div>
                    </div>
                </div>

                {/* ✨ ปุ่ม 3 จุด สำหรับเจ้าของโพสต์ */}
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
            
            {/* ✨ สลับระหว่างฟอร์มแก้ไข กับ เนื้อหาโพสต์ปกติ */}
            {isEditingPost ? (
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
<>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post.images.map(img => (
                                <img 
                                    key={img.id} 
                                    src={`/storage/${img.image_path}`} 
                                    alt="content" 
                                    className="w-full rounded-xl shadow-sm border object-contain bg-gray-50 max-h-[400px]"
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ปุ่มกดถูกใจโพสต์ */}
            {!isEditingPost && (
                <div className="flex items-center py-3 border-y border-gray-100 mb-2">
                    <button onClick={() => router.post(route('posts.like', post.id), {}, { preserveScroll: true })} className={`flex items-center gap-2 font-bold transition-all duration-300 ${isLiked ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-rose-400'}`}>
                        <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <span>{likeCount > 0 ? `${likeCount} ถูกใจ` : 'ถูกใจ'}</span>
                    </button>
                </div>
            )}

            {/* ส่วนของคอมเมนต์ */}
            <div className="bg-gray-50 rounded-xl p-5 mt-4 border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Comments ({mainComments.length})</h4>
                <div className="space-y-1">
                    {displayComments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} auth={auth} highlightId={highlightId} onReply={(c) => { setEditingComment(null); setReplyingTo(c); setCommentForm({ content: '', parent_id: c.id }); }} onEdit={(c) => { setReplyingTo(null); setEditingComment(c); setCommentForm('content', c.content); }} onDelete={(id) => confirm('ลบไหมคะ?') && router.delete(route('comments.destroy', id), { preserveScroll: true })} />
                    ))}
                </div>

                {mainComments.length > visibleCommentsCount && (
                    <button onClick={() => setVisibleCommentsCount(v => v + 5)} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">ดูคอมเมนต์เพิ่มเติม...</button>
                )}

                <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200 flex gap-2 items-end">
                    <textarea value={commentForm.content} onChange={e => setCommentForm('content', e.target.value)} placeholder={replyingTo ? `ตอบกลับ @${replyingTo.user.name}...` : "เขียนคอมเมนต์..."} rows="2" className="flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-y"></textarea>
                    <button disabled={commentProcessing || !commentForm.content.trim()} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition hover:bg-indigo-700 h-fit">
                        {editingComment ? 'บันทึก' : (replyingTo ? 'ตอบกลับ' : 'ส่ง')}
                    </button>
                </form>
            </div>
        </div>
    );
}