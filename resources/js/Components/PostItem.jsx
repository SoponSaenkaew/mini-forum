import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem';
import Dropdown from '@/Components/Dropdown';

export default function PostItem({ post, auth, highlightId = null }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

    const { data: commentForm, setData: setCommentForm, post: postComment, patch: patchComment, reset: resetComment, processing: commentProcessing } = useForm({
        content: '',
        parent_id: null,
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (editingComment) {
            patchComment(route('comments.update', editingComment.id), {
                onSuccess: () => { setEditingComment(null); resetComment(); },
                preserveScroll: true,
            });
        } else {
            postComment(route('comments.store', post.id), {
                onSuccess: () => { setReplyingTo(null); resetComment(); },
                preserveScroll: true,
            });
        }
    };

    const mainComments = post.comments?.filter(c => !c.parent_id) || [];
    const displayComments = mainComments.slice(0, visibleCommentsCount);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{post.user.name[0]}</div>
                    <div>
                        <Link href={route('profile.show', post.user.id)} className="font-bold text-gray-900 hover:text-indigo-600 transition">{post.user.name}</Link>
                        <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('th-TH')}</div>
                    </div>
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
            {post.image && <img src={`/storage/${post.image}`} alt="content" className="w-full rounded-xl mb-4 shadow-sm border" />}

            <div className="bg-gray-50 rounded-xl p-5 mt-6 border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Comments ({mainComments.length})</h4>
                <div className="space-y-1">
                    {displayComments.map(comment => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            auth={auth} 
                            highlightId={highlightId}
                            onReply={(c) => { setEditingComment(null); setReplyingTo(c); setCommentForm({ content: '', parent_id: c.id }); }}
                            onEdit={(c) => { setReplyingTo(null); setEditingComment(c); setCommentForm('content', c.content); }}
                            onDelete={(id) => confirm('ลบไหมคะ?') && router.delete(route('comments.destroy', id), { preserveScroll: true })}
                        />
                    ))}
                </div>

                {mainComments.length > visibleCommentsCount && (
                    <button onClick={() => setVisibleCommentsCount(v => v + 5)} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">
                        ดูคอมเมนต์เพิ่มเติม...
                    </button>
                )}

                <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200 flex gap-2 items-end">
                    <textarea 
                        value={commentForm.content}
                        onChange={e => setCommentForm('content', e.target.value)}
                        placeholder={replyingTo ? `ตอบกลับ @${replyingTo.user.name}...` : "เขียนคอมเมนต์..."}
                        rows="2"
                        className="flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 shadow-sm resize-y"
                    ></textarea>
                    <button disabled={commentProcessing || !commentForm.content.trim()} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition hover:bg-indigo-700 h-fit">
                        {editingComment ? 'บันทึก' : (replyingTo ? 'ตอบกลับ' : 'ส่ง')}
                    </button>
                </form>
            </div>
        </div>
    );
}