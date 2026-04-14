import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
// ✨ นำเข้า CommentItem จากส่วนกลางมาใช้เลยค่ะ
import CommentItem from '@/Components/CommentItem'; 

// ✨ สร้าง Component ย่อย สำหรับจัดการ 1 โพสต์ (ทำให้ State ของฟอร์มคอมเมนต์ไม่ตีกัน)
const PostItem = ({ post, auth}) => {
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

    const showMoreComments = () => {
        setVisibleCommentsCount(prev => prev + 5);
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
                            onReply={handleReply}
                            onEdit={handleEditComment}
                            onDelete={handleDeleteComment}
                        />
                    ))}
                </div>

                {mainComments.length > visibleCommentsCount && (
                    <button 
                        onClick={showMoreComments}
                        className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                    >
                        ดูคอมเมนต์เพิ่มเติมอีก {mainComments.length - visibleCommentsCount} รายการ...
                    </button>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                    {replyingTo && (
                        <div className="mb-2 flex justify-between items-center bg-indigo-50 px-3 py-1 rounded-lg text-xs text-indigo-600 font-medium border border-indigo-100">
                            <span>กำลังตอบกลับ <b>@{replyingTo.user.name}</b></span>
                            <button onClick={() => { setReplyingTo(null); resetComment(); }} className="font-bold">✕</button>
                        </div>
                    )}
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                        <textarea
                            type="text" 
                            value={commentForm.content}
                            onChange={e => setCommentForm('content', e.target.value)}
                            placeholder={replyingTo ? `ตอบกลับ @${replyingTo.user.name}...` : "เขียนคอมเมนต์..."}
                            className="flex-1 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 shadow-sm"
                        ></textarea>
                        <button disabled={commentProcessing || !commentForm.content.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition hover:bg-indigo-700 disabled:opacity-50">
                            {editingComment ? 'บันทึก' : (replyingTo ? 'ตอบกลับ' : 'ส่ง')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ✨ หน้า Dashboard หลัก โค้ดจะดูสะอาดขึ้นเยอะเลยค่ะ!
export default function Dashboard({ auth, posts, searchedUsers = [], filters = {} }) {
    const { data, setData, post, processing, reset } = useForm({ title: '', content: '', image: null });
    const fileInputRef = useRef();


    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { search: searchQuery }, { 
            preserveState: true, // ไม่ต้องรีโหลดหน้าใหม่ทั้งหน้า
            replace: true 
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Community Feed ✨</h2>}>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-4 shadow-sm sm:rounded-xl border border-gray-100 flex gap-2">
                        <form onSubmit={handleSearch} className="flex w-full gap-2">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาโพสต์ หรือ ชื่อผู้ใช้..." 
                                className="flex-1 border-gray-200 rounded-lg focus:ring-indigo-500"
                            />
                            <button type="submit" className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-200 transition">
                                ค้นหา 🔍
                            </button>
                            {filters.search && (
                                <Link href={route('dashboard')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">
                                    ล้าง
                                </Link>
                            )}
                        </form>
                    </div>

                    {/* ✨ แสดงรายชื่อผู้ใช้ที่ค้นหาเจอ (ถ้ามี) */}
                    {searchedUsers.length > 0 && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-600 mb-3">👤 ผู้ใช้ที่พบ:</h4>
                            <div className="flex flex-wrap gap-2">
                                {searchedUsers.map(user => (
                                    <Link key={user.id} href={route('profile.show', user.id)} className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition">
                                        <div className="h-6 w-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-800 font-bold">{user.name[0]}</div>
                                        <span className="text-sm text-indigo-900 font-medium">{user.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    
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
                        {posts.map(post => (
                            <PostItem key={post.id} post={post} auth={auth} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}