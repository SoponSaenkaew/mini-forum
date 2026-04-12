import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // ✨ เพิ่ม router เข้ามาเพื่อใช้สั่งลบค่ะ

export default function Dashboard({ auth, posts }) {
    // 1. เตรียมถังข้อมูลสำหรับฟอร์ม
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
    });

    // 2. ฟังก์ชันสำหรับส่งข้อมูลโพสต์ใหม่
    const submit = (e) => {
        e.preventDefault();
        post(route('posts.store'), {
            onSuccess: () => reset(),
        });
    };

    // ✨ 3. ฟังก์ชันสำหรับลบโพสต์
    const handleDelete = (postId) => {
        if (confirm('เซนเซแน่ใจนะว่าจะลบโพสต์นี้? มันกู้คืนไม่ได้นะคะ!')) {
            router.delete(route('posts.destroy', postId));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard - เริ่มแชร์เรื่องราวกันเถอะ! 
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- ฟอร์มสร้างโพสต์ --- */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={data.title}
                                    placeholder="หัวข้อโพสต์..."
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div>
                                <textarea
                                    value={data.content}
                                    placeholder="วันนี้มีอะไรสนุกๆ เกิดขึ้นบ้างคะเซนเซ?"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-32"
                                    onChange={e => setData('content', e.target.value)}
                                ></textarea>
                                {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {processing ? 'กำลังส่งข้อมูล...' : 'โพสต์เลย! ✨'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- รายการโพสต์ --- */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-700 px-1">โพสต์ล่าสุดจากเพื่อนๆ 📢</h3>
                        
                        {posts && posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="p-4 bg-white border rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-indigo-600">{post.user.name}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(post.created_at).toLocaleString('th-TH')}
                                            </span>
                                        </div>

                                        {/* ✨ ปุ่มลบ: จะแสดงเฉพาะเจ้าของโพสต์เท่านั้น */}
                                        {post.user_id === auth.user.id && (
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-400 hover:text-red-600 transition text-sm"
                                            >
                                                ลบโพสต์
                                            </button>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-800">{post.title}</h4>
                                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg border text-gray-400">
                                ยังไม่มีใครโพสต์เลยค่ะ... มาริเริ่มโพสต์แรกกันเถอะ! ✨
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}