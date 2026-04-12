import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Dashboard() {
    // 1. เตรียมถังข้อมูลสำหรับฟอร์ม (Arona Helper!)
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
    });

    // 2. ฟังก์ชันสำหรับส่งข้อมูลไปให้ Laravel หลังบ้าน
    const submit = (e) => {
        e.preventDefault();
        post(route('posts.store'), {
            onSuccess: () => reset(), // พอโพสต์สำเร็จ ก็ล้างช่องพิมพ์ให้สะอาดกริ๊บ!
        });
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
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* --- ส่วนของฟอร์มสร้างโพสต์ --- */}
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
                        {/* --------------------------- */}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}