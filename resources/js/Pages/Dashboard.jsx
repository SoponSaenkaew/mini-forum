import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Dropdown from '@/Components/Dropdown'; 
import { Head, useForm, router, Link } from '@inertiajs/react'; 
import { useState, useRef } from 'react';

/**
 * @component CommentItem
 * @description แสดงผลคอมเมนต์เดี่ยว พร้อมระบบเปิด-ปิด (Toggle) คอมเมนต์ย่อย
 */
const CommentItem = ({ comment, auth, onReply, onEdit, onDelete, level = 0 }) => {
    // ✨ State สำหรับเปิด-ปิดการแสดงผลคอมเมนต์ย่อย
    const [isExpanded, setIsExpanded] = useState(false);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className={`mt-3 ${level > 0 ? 'ml-8 border-l-2 border-indigo-100 pl-4' : ''}`}>
            <div className="group relative flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-sm text-gray-800 leading-relaxed">
                        <Link href={route('profile.show', comment.user.id)} className="font-bold text-indigo-600 hover:underline mr-2">
                            {comment.user.name}
                        </Link>
                        {comment.parent && (
                            <span className="text-indigo-400 font-medium mr-2">
                                ↪ @{comment.parent.user.name}
                            </span>
                        )}
                        <span>{comment.content}</span>
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-[10px]">
                        <span className="text-gray-400">
                            {new Date(comment.created_at).toLocaleString('th-TH')}
                        </span>
                        <button 
                            onClick={() => onReply(comment)}
                            className="font-bold text-gray-500 hover:text-indigo-600 transition"
                        >
                            ตอบกลับ
                        </button>

                        {/* ✨ ปุ่มกาง/หุบคอมเมนต์ย่อย */}
                        {hasReplies && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="font-bold text-indigo-500 hover:text-indigo-700 transition flex items-center gap-1"
                            >
                                {isExpanded ? '🔼 ซ่อน' : `🔽 ดูการตอบกลับ (${comment.replies.length})`}
                            </button>
                        )}
                    </div>
                </div>

                {comment.user_id === auth.user.id && (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <button onClick={() => onEdit(comment)} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-gray-700">แก้ไข</button>
                            <button onClick={() => onDelete(comment.id)} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-red-500 font-bold">ลบ</button>
                        </Dropdown.Content>
                    </Dropdown>
                )}
            </div>

            {/* ✨ แสดงคอมเมนต์ย่อยเฉพาะเมื่อกดกางออกเท่านั้น */}
            {isExpanded && hasReplies && (
                <div className="mt-2 space-y-2 transition-all duration-300">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            auth={auth} 
                            onReply={onReply} 
                            onEdit={onEdit} 
                            onDelete={onDelete}
                            level={level + 1} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Dashboard({ auth, posts }) {
    const { data, setData, post, processing, reset, errors } = useForm({ title: '', content: '', image: null });
    const [editingId, setEditingId] = useState(null);
    const { data: editData, setData: setEditData, post: postUpdate } = useForm({ title: '', content: '', image: null, _method: 'patch' });
    const fileInputRef = useRef();

    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    // ✨ State สำหรับควบคุมจำนวนการแสดงผลคอมเมนต์หลักเบื้องต้น
    const [visibleCommentsCount, setVisibleCommentsCount] = useState({});

    const { data: commentForm, setData: setCommentForm, post: postComment, patch: patchComment, reset: resetComment, processing: commentProcessing } = useForm({
        content: '',
        parent_id: null,
    });

    const handleCommentSubmit = (e, postId) => {
        e.preventDefault();
        if (editingComment) {
            patchComment(route('comments.update', editingComment.id), {
                onSuccess: () => { setEditingComment(null); resetComment(); },
                preserveScroll: true,
            });
        } else {
            postComment(route('comments.store', postId), {
                onSuccess: () => { setReplyingTo(null); resetComment(); },
                preserveScroll: true,
            });
        }
    };

    const handleReply = (comment) => {
        setEditingComment(null);
        setReplyingTo(comment);
        setCommentForm({ content: '', parent_id: comment.id });
    };

    const handleEditComment = (comment) => {
        setReplyingTo(null);
        setEditingComment(comment);
        setCommentForm('content', comment.content);
    };

    const handleDeleteComment = (commentId) => {
        if (confirm('ลบคอมเมนต์นี้จริงๆ หรอคะเซนเซ?')) {
            router.delete(route('comments.destroy', commentId), { preserveScroll: true });
        }
    };

    // ✨ ฟังก์ชันเพิ่มการมองเห็นคอมเมนต์หลัก
    const showMoreComments = (postId) => {
        setVisibleCommentsCount(prev => ({
            ...prev,
            [postId]: (prev[postId] || 3) + 5
        }));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Community Feed ✨</h2>}>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ฟอร์มสร้างโพสต์ */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-xl border border-gray-100">
                        <form onSubmit={(e) => { e.preventDefault(); post(route('posts.store'), { onSuccess: () => { reset(); if (fileInputRef.current) fileInputRef.current.value = ''; } }); }} className="space-y-4">
                            <input type="text" value={data.title} placeholder="หัวข้อที่คุณต้องการแชร์..." className="w-full border-gray-200 rounded-lg focus:ring-indigo-500" onChange={e => setData('title', e.target.value)} />
                            <textarea value={data.content} placeholder="วันนี้มีเรื่องอะไรน่าสนใจบ้างคะเซนเซ?" className="w-full border-gray-200 rounded-lg h-32" onChange={e => setData('content', e.target.value)}></textarea>
                            <div className="flex items-center justify-between">
                                <input type="file" ref={fileInputRef} onChange={e => setData('image', e.target.files[0])} className="text-xs text-gray-500" />
                                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold transition shadow-md">โพสต์เลย!</button>
                            </div>
                        </form>
                    </div>

                    {/* รายการโพสต์ */}
                    <div className="space-y-6">
                        {posts.map(post => {
                            const mainComments = post.comments?.filter(c => !c.parent_id) || [];
                            const visibleLimit = visibleCommentsCount[post.id] || 3;
                            const displayComments = mainComments.slice(0, visibleLimit);

                            return (
                                <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

                                    {/* ✨ ส่วนคอมเมนต์แบบปรับปรุงใหม่ ✨ */}
                                    <div className="bg-gray-50 rounded-xl p-5 mt-6 border border-gray-100">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Comments ({mainComments.length})</h4>
                                        <div className="space-y-1">
                                            {displayComments.map(comment => (
                                                <CommentItem 
                                                    key={comment.id} 
                                                    comment={comment} 
                                                    auth={auth} 
                                                    onReply={handleReply}
                                                    onEdit={handleEditComment}
                                                    onDelete={handleDeleteComment}
                                                />
                                            ))}
                                        </div>

                                        {/* ✨ ปุ่มดูคอมเมนต์หลักเพิ่มเติม */}
                                        {mainComments.length > visibleLimit && (
                                            <button 
                                                onClick={() => showMoreComments(post.id)}
                                                className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                                            >
                                                ดูคอมเมนต์เพิ่มเติมอีก {mainComments.length - visibleLimit} รายการ...
                                            </button>
                                        )}

                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            {replyingTo && (
                                                <div className="mb-2 flex justify-between items-center bg-indigo-50 px-3 py-1 rounded-lg text-xs text-indigo-600 font-medium border border-indigo-100">
                                                    <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                                                    <button onClick={() => { setReplyingTo(null); resetComment(); }} className="font-bold">✕</button>
                                                </div>
                                            )}
                                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={commentForm.content}
                                                    onChange={e => setCommentForm('content', e.target.value)}
                                                    placeholder={replyingTo ? `ตอบกลับ @${replyingTo.user.name}...` : "เขียนคอมเมนต์..."}
                                                    className="flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 shadow-sm"
                                                />
                                                <button disabled={commentProcessing || !commentForm.content.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition hover:bg-indigo-700 disabled:opacity-50">
                                                    {editingComment ? 'บันทึก' : (replyingTo ? 'ตอบกลับ' : 'ส่ง')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}