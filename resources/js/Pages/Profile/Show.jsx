import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Dropdown from '@/Components/Dropdown';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';

/**
 * @component CommentForm
 * @description คอมโพเนนต์ฟอร์มสำหรับสร้างคอมเมนต์ใหม่ (ใช้ซ้ำได้)
 */
const CommentForm = ({ postId }) => {
    const { data, setData, post, processing, reset } = useForm({
        content: '',
    });

    const submitComment = (e) => {
        e.preventDefault();
        post(route('comments.store', postId), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submitComment} className="mt-4 flex flex-col gap-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={data.content}
                    onChange={e => setData('content', e.target.value)}
                    placeholder="เขียนคอมเมนต์ที่นี่..."
                    className="flex-1 border-gray-300 rounded-md text-sm shadow-sm focus:border-indigo-500"
                />
                <button 
                    disabled={processing || !data.content.trim()}
                    className="bg-gray-800 text-white px-4 py-1 rounded-md text-sm font-bold hover:bg-gray-700 transition"
                >
                    ส่ง
                </button>
            </div>
        </form>
    );
};

/**
 * @page Profile Show
 * @description หน้าแสดงข้อมูลโปรไฟล์และรายการโพสต์แบบเต็มรูปแบบ
 */
export default function Show({ auth, user, posts }) {
    // --- สเตตัสจัดการโหมดแก้ไขโพสต์และคอมเมนต์ ---
    const [editingId, setEditingId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);

    // --- useForm สำหรับการส่งคำขอแก้ไขข้อมูล ---
    const { data: editData, setData: setEditData, post: postUpdate, processing: editProcessing } = useForm({
        title: '',
        content: '',
        image: null,
        _method: 'patch', 
    });

    const { data: editCommentData, setData: setEditCommentData, patch: patchComment } = useForm({
        content: '',
    });

    // --- ฟังก์ชันจัดการข้อมูล (Handlers) ---
    const startEdit = (post) => {
        setEditingId(post.id);
        setEditData({ title: post.title, content: post.content, image: null, _method: 'patch' });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        postUpdate(route('posts.update', editingId), {
            onSuccess: () => setEditingId(null),
            preserveScroll: true,
        });
    };

    const submitCommentUpdate = (e) => {
        e.preventDefault();
        patchComment(route('comments.update', editingCommentId), {
            onSuccess: () => setEditingCommentId(null),
            preserveScroll: true,
        });
    };

    const handleDelete = (postId) => {
        if (confirm('เซนเซแน่ใจนะว่าจะลบโพสต์นี้?')) {
            router.delete(route('posts.destroy', postId));
        }
    };

    const handleDeleteComment = (commentId) => {
        if (confirm('เซนเซแน่ใจนะว่าจะลบคอมเมนต์นี้?')) {
            router.delete(route('comments.destroy', commentId), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout 
            header={<h2 className="text-xl font-semibold text-gray-800">โปรไฟล์ของ {user.name} 👤</h2>}
        >
            <Head title={`Profile - ${user.name}`} />
            
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- ส่วนหัวข้อมูลผู้ใช้ --- */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="h-24 w-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-4xl text-indigo-700 font-bold mb-4">
                            {user.name[0]}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                        {user.is_admin && (
                            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                🛡️ System Admin
                            </span>
                        )}
                    </div>

                    <h4 className="font-bold text-lg text-gray-700 px-2">โพสต์ทั้งหมด ({posts.length})</h4>

                    {/* --- รายการโพสต์แบบ Card --- */}
                    <div className="space-y-6">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    {editingId === post.id ? (
                                        /* --- โหมดแก้ไขโพสต์ --- */
                                        <form onSubmit={submitUpdate} className="space-y-4">
                                            <input type="text" value={editData.title} className="w-full border-gray-200 rounded-lg" onChange={e => setEditData('title', e.target.value)} />
                                            <textarea value={editData.content} className="w-full border-gray-200 rounded-lg h-24" onChange={e => setEditData('content', e.target.value)}></textarea>
                                            <input type="file" onChange={e => setEditData('image', e.target.files[0])} className="text-sm" />
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setEditingId(null)} className="text-gray-400">ยกเลิก</button>
                                                <button disabled={editProcessing} className="bg-indigo-600 text-white px-4 py-1 rounded-md">บันทึก</button>
                                            </div>
                                        </form>
                                    ) : (
                                        /* --- โหมดแสดงผลปกติ --- */
                                        <>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-bold">{user.name[0]}</div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('th-TH')}</div>
                                                    </div>
                                                </div>
                                                
                                                {/* ปุ่มสามจุด (เฉพาะเจ้าของโพสต์) */}
                                                {post.user_id === auth.user.id && (
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button className="text-gray-400 hover:text-gray-600 transition">
                                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                            </button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content>
                                                            <button onClick={() => startEdit(post)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 font-medium transition">แก้ไขโพสต์</button>
                                                            <button onClick={() => handleDelete(post.id)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 font-bold transition">ลบโพสต์</button>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
                                            
                                            {post.image && (
                                                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                                                    <img src={`/storage/${post.image}`} alt="Post" className="w-full h-auto object-cover max-h-[500px]" />
                                                </div>
                                            )}

                                            {/* --- ส่วนคอมเมนต์ --- */}
                                            <div className="bg-gray-50 rounded-xl p-5 mt-6 border border-gray-100">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Comments ({post.comments?.length || 0})</h4>
                                                <div className="space-y-4">
                                                    {post.comments?.map(comment => (
                                                        <div key={comment.id} className="group relative">
                                                            {editingCommentId === comment.id ? (
                                                                <form onSubmit={submitCommentUpdate} className="flex gap-2">
                                                                    <input type="text" value={editCommentData.content} onChange={e => setEditCommentData('content', e.target.value)} className="flex-1 border-gray-300 rounded-lg text-sm" />
                                                                    <button type="submit" className="text-indigo-600 font-bold text-sm">บันทึก</button>
                                                                    <button type="button" onClick={() => setEditingCommentId(null)} className="text-gray-400 text-sm">ยกเลิก</button>
                                                                </form>
                                                            ) : (
                                                                <div className="flex justify-between items-start">
                                                                    <p className="text-sm text-gray-800">
                                                                        <Link href={route('profile.show', comment.user.id)} className="font-bold text-indigo-600 hover:underline mr-2">
                                                                            {comment.user.name}
                                                                        </Link>
                                                                        {comment.content}
                                                                    </p>
                                                                    {comment.user_id === auth.user.id && (
                                                                        <Dropdown>
                                                                            <Dropdown.Trigger>
                                                                                <button className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg></button>
                                                                        </Dropdown.Trigger>
                                                                        <Dropdown.Content>
                                                                            <button onClick={() => { setEditingCommentId(comment.id); setEditCommentData('content', comment.content); }} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-gray-700 transition">แก้ไข</button>
                                                                            <button onClick={() => handleDeleteComment(comment.id)} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-red-500 font-bold transition">ลบ</button>
                                                                        </Dropdown.Content>
                                                                        </Dropdown>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <CommentForm postId={post.id} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                                ผู้ใช้คนนี้ยังไม่เคยโพสต์อะไรเลยค่ะ... 🎈
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}