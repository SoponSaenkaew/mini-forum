import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import CommentItem from '@/Components/CommentItem';

export default function Show({ auth, post, highlightId }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);

    const { data: commentForm, setData: setCommentForm, post: postComment, patch: patchComment, reset: resetComment, processing: commentProcessing } = useForm({
        content: '',
        parent_id: null,
    });

    // ✨ ฟังก์ชันค้นหาแบบ Recursion ว่าคอมเมนต์นี้หรือลูกๆ ของมัน มี targetId ซ่อนอยู่หรือไม่
    const containsHighlight = (comment, targetId) => {
        if (comment.id === targetId) return true;
        if (comment.replies && comment.replies.length > 0) {
            return comment.replies.some(reply => containsHighlight(reply, targetId));
        }
        return false;
    };

    // ✨ ตรรกะ: ดันคอมเมนต์หลัก (ที่มีตัวถูกไฮไลท์ซ่อนอยู่) ขึ้นมาไว้บรรทัดแรกสุด
    const sortedComments = [...(post.comments || [])].sort((a, b) => {
        const aHasHighlight = containsHighlight(a, highlightId);
        const bHasHighlight = containsHighlight(b, highlightId);
        
        if (aHasHighlight && !bHasHighlight) return -1;
        if (!aHasHighlight && bHasHighlight) return 1;
        return 0;
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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">กระทู้ฉบับเต็ม ✨</h2>}>
            <Head title={`Post: ${post.title}`} />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="text-3xl font-bold mb-4">{post.title}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap mb-8 text-lg">{post.content}</p>
                        {post.image && <img src={`/storage/${post.image}`} className="w-full rounded-2xl mb-8 border" alt="content" />}

                        {/* ส่วนคอมเมนต์ */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Comments</h4>
                            <div className="space-y-2">
                                {/* ✨ กรองคอมเมนต์หลัก และส่ง highlightId ลงไปให้ตัวกลาง */}
                                {sortedComments.filter(c => !c.parent_id).map(comment => (
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

                            {/* ฟอร์มคอมเมนต์ล่างสุด */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                {replyingTo && (
                                    <div className="mb-2 flex justify-between items-center bg-indigo-50 px-3 py-1 rounded-lg text-xs text-indigo-600 font-medium">
                                        <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                                        <button onClick={() => { setReplyingTo(null); resetComment(); }} className="font-bold">✕</button>
                                    </div>
                                )}
                                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                    <input type="text" value={commentForm.content} onChange={e => setCommentForm('content', e.target.value)} className="flex-1 rounded-xl border-gray-200" placeholder="ร่วมแสดงความคิดเห็น..." />
                                    <button disabled={commentProcessing || !commentForm.content.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">ส่ง</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}