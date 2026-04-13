import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Dropdown from '@/Components/Dropdown'; // ✨ นำเข้า Dropdown เพื่อทำปุ่มสามจุด
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * คอมโพเนนต์สำหรับสร้างคอมเมนต์ใหม่
 */
const CommentForm = ({ postId }) => {
    const { data, setData, post, processing, reset, errors } = useForm({
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
                    className="flex-1 border-gray-300 rounded-md text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

export default function Dashboard({ auth, posts }) {
    // --- 1. การจัดการสถานะฟอร์มโพสต์ใหม่ ---
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
    });

    // --- 2. การจัดการสถานะการแก้ไขโพสต์ ---
    const [editingId, setEditingId] = useState(null);
    const { data: editData, setData: setEditData, patch, processing: editProcessing } = useForm({
        title: '',
        content: '',
    });

    // --- 3. การจัดการสถานะการแก้ไขคอมเมนต์ ---
    const [editingCommentId, setEditingCommentId] = useState(null);
    const { data: editCommentData, setData: setEditCommentData, patch: patchComment } = useForm({
        content: '',
    });

    /**
     * ส่งข้อมูลสร้างโพสต์ใหม่
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('posts.store'), { onSuccess: () => reset() });
    };

    /**
     * เริ่มเข้าสู่โหมดแก้ไขโพสต์
     */
    const startEdit = (post) => {
        setEditingId(post.id);
        setEditData({ title: post.title, content: post.content });
    };

    /**
     * บันทึกข้อมูลโพสต์ที่แก้ไข
     */
    const submitUpdate = (e) => {
        e.preventDefault();
        patch(route('posts.update', editingId), {
            onSuccess: () => setEditingId(null),
            preserveScroll: true,
        });
    };

    /**
     * บันทึกข้อมูลคอมเมนต์ที่แก้ไข
     */
    const submitCommentUpdate = (e) => {
        e.preventDefault();
        patchComment(route('comments.update', editingCommentId), {
            onSuccess: () => setEditingCommentId(null),
            preserveScroll: true,
        });
    };

    // --- ฟังก์ชันการลบข้อมูล ---
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard ✨</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ส่วนฟอร์มสร้างโพสต์ */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-4">
                            <input
                                type="text"
                                value={data.title}
                                placeholder="หัวข้อที่คุณต้องการแชร์..."
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500"
                                onChange={e => setData('title', e.target.value)}
                            />
                            <textarea
                                value={data.content}
                                placeholder="วันนี้มีอะไรสนุกๆ เกิดขึ้นบ้างคะ?"
                                className="w-full border-gray-300 rounded-md h-32"
                                onChange={e => setData('content', e.target.value)}
                            ></textarea>
                            <div className="flex justify-end">
                                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-bold transition">
                                    โพสต์เลย! ✨
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* รายการฟีดโพสต์ */}
                    <div className="space-y-4">
                        {posts.map(post => (
                            <div key={post.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                                {editingId === post.id ? (
                                    <form onSubmit={submitUpdate} className="space-y-3">
                                        <input
                                            type="text"
                                            value={editData.title}
                                            className="w-full border-gray-300 rounded-md"
                                            onChange={e => setEditData('title', e.target.value)}
                                        />
                                        <textarea
                                            value={editData.content}
                                            className="w-full border-gray-300 rounded-md h-24"
                                            onChange={e => setEditData('content', e.target.value)}
                                        ></textarea>
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-sm">ยกเลิก</button>
                                            <button disabled={editProcessing} className="bg-indigo-600 text-white px-4 py-1 rounded-md text-sm">บันทึก</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-indigo-600 text-lg">{post.user.name}</span>
                                                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('th-TH')}</span>
                                            </div>

                                            {/* ✨ ปุ่มสามจุดสำหรับโพสต์ */}
                                            {post.user_id === auth.user.id && (
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="text-gray-400 hover:text-gray-600 transition">
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content>
                                                        <button onClick={() => startEdit(post)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">แก้ไขโพสต์</button>
                                                        <button onClick={() => handleDelete(post.id)} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">ลบโพสต์</button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-2">{post.title}</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                    </>
                                )}

                                {/* ส่วนของคอมเมนต์ */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h5 className="text-sm font-bold text-gray-500 mb-4 uppercase">ความคิดเห็น ({post.comments?.length || 0})</h5>
                                    <div className="space-y-4">
                                        {post.comments?.map(comment => (
                                            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg relative group">
                                                {editingCommentId === comment.id ? (
                                                    <form onSubmit={submitCommentUpdate} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editCommentData.content}
                                                            onChange={e => setEditCommentData('content', e.target.value)}
                                                            className="flex-1 border-gray-300 rounded-md text-sm"
                                                        />
                                                        <button type="submit" className="text-indigo-600 font-bold text-sm">บันทึก</button>
                                                        <button onClick={() => setEditingCommentId(null)} className="text-gray-400 text-sm">ยกเลิก</button>
                                                    </form>
                                                ) : (
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm text-gray-800">
                                                            <span className="font-bold text-indigo-600 mr-2">{comment.user.name}</span>
                                                            {comment.content}
                                                        </p>
                                                        
                                                        {/* ✨ ปุ่มสามจุดสำหรับคอมเมนต์ */}
                                                        {comment.user_id === auth.user.id && (
                                                            <Dropdown>
                                                                <Dropdown.Trigger>
                                                                    <button className="text-gray-300 hover:text-gray-500 transition">
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                        </svg>
                                                                    </button>
                                                                </Dropdown.Trigger>
                                                                <Dropdown.Content>
                                                                    <button onClick={() => { setEditingCommentId(comment.id); setEditCommentData('content', comment.content); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">แก้ไข</button>
                                                                    <button onClick={() => handleDeleteComment(comment.id)} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">ลบ</button>
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}