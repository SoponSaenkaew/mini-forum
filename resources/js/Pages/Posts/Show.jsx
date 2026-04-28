import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PostItem from '@/Components/PostItem'; // 🌟 นำเข้า PostItem มาใช้งาน

/**
 * @component Show
 * @description หน้าแสดงรายละเอียดกระทู้ฉบับเต็ม (Full Post View) 
 * 🌟 [อัปเดต] ใช้คอมโพเนนต์ PostItem เพื่อให้รองรับระบบการแก้ไขโพสต์ (Edit Post) ในตัวแบบเดียวกับหน้าฟีด
 * * @param {Object} props - ข้อมูล Props ที่ได้รับมาจากเซิร์ฟเวอร์
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบัน
 * @param {Object} props.post - ข้อมูลรายละเอียดโพสต์
 * @param {number|string|null} props.highlightId - รหัสของความคิดเห็นเป้าหมาย
 */
export default function Show({ auth, post, highlightId }) {
    // ป้องกันกรณีที่ข้อมูล post ไม่ถูกส่งมา
    if (!post) return <div className="text-center py-20">ไม่พบข้อมูลโพสต์</div>;

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-4">
                <Link 
                    href={route('dashboard')} 
                    className="text-gray-500 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="กลับไปหน้าหลัก"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </Link>
                <h2 className="text-xl font-semibold text-gray-800">กระทู้เต็ม</h2>
            </div>
        }>
            
            <Head>
                <title>{`Post: ${post.title}`}</title>
                {/* ดึงแท็ก HTML ออกจาก Description เพื่อทำ SEO */}
                <meta name="description" content={post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : 'รายละเอียดโพสต์'} />
            </Head>
            
            <main className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* 🌟 เรียกใช้ PostItem!
                      เพียงแค่ส่ง props ให้ครบ PostItem ก็จะจัดการแสดงผลเนื้อหา, 
                      ฟอร์มแก้ไข, แกลเลอรีรูปภาพ, ปุ่มถูกใจ และคอมเมนต์ให้ทั้งหมด! 
                    */}
                    <PostItem 
                        post={post} 
                        auth={auth} 
                        highlightId={highlightId}
                        // 🌟 บังคับให้ PostItem แสดงข้อความแบบเต็มเสมอ (ไม่ต้องมีระบบ Read More)
                        isExpandedDefault={true} 
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
}