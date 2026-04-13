import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CommentItem from '@/Components/CommentItem'; // ✨ เรียกใช้ตัวกลางเดียวกับ Dashboard/Post

export default function ReplyPage({ auth, targetComment }) {
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        parent_id: targetComment.id, // ✨ ล็อกไว้ตอบตัวนี้โดยเฉพาะ
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('comments.store', targetComment.post_id), { onSuccess: () => reset() });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">ตอบกลับความคิดเห็น ✨</h2>}>
            <Head title="Reply to Comment" />
            <div className="py-12 bg-gray-50">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* ✨ แสดงคอมเมนต์เป้าหมายแบบไฮไลท์สีทองไว้ที่ส่วนหัว */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 mb-6">
                        <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-4 tracking-widest">คอมเมนต์เป้าหมาย</h4>
                        <CommentItem 
                            comment={targetComment} 
                            auth={auth} 
                            highlightId={targetComment.id} // ✨ สั่งให้ไฮไลท์ตัวนี้
                            onReply={() => {}} 
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <form onSubmit={submit} className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">พิมพ์คำตอบกลับถึง @{targetComment.user.name}</label>
                            <textarea value={data.content} onChange={e => setData('content', e.target.value)} className="w-full border-gray-200 rounded-xl h-32 focus:ring-indigo-500" placeholder="ใส่ความคิดเห็นของคุณที่นี่..." />
                            <div className="flex justify-end gap-2">
                                <Link href={route('notifications.index')} className="px-4 py-2 text-sm text-gray-400">ยกเลิก</Link>
                                <button disabled={processing || !data.content.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                                    ส่งคำตอบกลับ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}