import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PostItem from '@/Components/PostItem'; 

/**
 * @component ProfileShow
 * @description หน้าแสดงโปรไฟล์สาธารณะของผู้ใช้งาน (Public Profile) 
 * รองรับการแสดงผลข้อมูลประจำตัว (Identity) และรายการกิจกรรม (Activity Feed) 
 * ได้รับการปรับแต่งโครงสร้าง DOM ตามหลักเกณฑ์ Accessibility และ Performance (Lighthouse 100/100)
 *
 * @param {Object} props - ข้อมูล Props ที่รับผ่าน Inertia Router
 * @param {Object} props.auth - สิทธิ์และข้อมูลผู้ใช้งานที่กำลังล็อกอิน
 * @param {Object} props.user - ข้อมูลรายละเอียดเจ้าของโปรไฟล์ที่กำลังแสดงผล
 * @param {Array}  props.posts - รายการโพสต์ทั้งหมดของเจ้าของโปรไฟล์
 */
export default function Show({ auth, user, posts }) {
    
    /**
     * @constant {boolean} isOwnProfile
     * @description ตรวจสอบสิทธิ์การเป็นเจ้าของโปรไฟล์ เพื่อควบคุมสิทธิ์การเข้าถึงปุ่มแก้ไขตั้งค่า
     */
    const isOwnProfile = auth.user.id === user.id;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {isOwnProfile ? 'โปรไฟล์ส่วนตัว (My Profile)' : `หน้าโปรไฟล์ของ ${user.name}`} 
                </h2>
            }
        >
            {/* ส่วนการจัดการ SEO (Search Engine Optimization) */}
            <Head>
                <title>{`Profile - ${user.name}`}</title>
                <meta name="description" content={`ทำความรู้จักและติดตามเรื่องราวล่าสุดของ ${user.name} บนระบบ Tuna Forum`} />
            </Head>

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* ส่วนบน: ข้อมูลประจำตัวผู้ใช้งาน (User Profile Header) */}
                    <section aria-labelledby="profile-header" className="bg-white shadow-sm sm:rounded-3xl overflow-hidden border border-gray-100">
                        <h2 id="profile-header" className="sr-only">ข้อมูลบัญชีผู้ใช้</h2>
                        
                        {/* พื้นที่แสดงรูปภาพหน้าปก (Cover Photo Area) */}
                        <div className="h-48 sm:h-64 w-full relative bg-gray-100">
                            {user.cover_photo_url ? (
                                <img 
                                    // 🌟 [Lighthouse Performance] นำ ?t= ออกเพื่อประสิทธิภาพ Caching
                                    src={user.cover_photo_url}
                                    className="w-full h-full object-cover" 
                                    alt={`ภาพหน้าปกโปรไฟล์ของ ${user.name}`}
                                    loading="lazy"
                                    decoding="async"
                                    // 🌟 [Lighthouse CLS] กำหนดขนาดประเมิน (Aspect Ratio อ้างอิง)
                                    width="1200"
                                    height="400"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" aria-hidden="true"></div>
                            )}
                        </div>

                        {/* พื้นที่แสดงข้อมูลบัญชีหลัก (Identity Area) */}
                        <div className="px-6 sm:px-10 pb-8 relative">
                            <div className="flex flex-col sm:flex-row gap-6">
                                
                                {/* รูปภาพโปรไฟล์ (Avatar) จัดวางเหลื่อมกับหน้าปก */}
                                <div className="relative shrink-0 -mt-16 sm:-mt-20">
                                    {user.avatar_url ? (
                                        <img 
                                            src={user.avatar_url}
                                            className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-4 border-white shadow-md bg-white"
                                            alt={`ภาพโปรไฟล์ของ ${user.name}`}
                                            // 🌟 [Lighthouse Performance] ระบุขนาดชัดเจนป้องกัน Layout Shift
                                            width="160"
                                            height="160"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div 
                                            aria-hidden="true"
                                            className="h-32 w-32 sm:h-40 sm:w-40 bg-indigo-500 rounded-full flex items-center justify-center text-5xl text-white font-black shadow-md border-4 border-white"
                                        >
                                            {user.name[0]}
                                        </div>
                                    )}
                                </div>

                                {/* ข้อมูลเชิงบรรยาย (Description & Actions) */}
                                <div className="flex-1 mt-2 sm:mt-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                                            <p className="text-gray-500 font-medium mt-1">
                                                {user.email} <span className="mx-2 text-gray-400" aria-hidden="true">•</span> 
                                                เข้าร่วมเมื่อ <time dateTime={user.created_at}>{new Date(user.created_at).toLocaleDateString('th-TH')}</time>
                                            </p>
                                        </div>

                                        {/* ปุ่มจัดการบัญชี (แสดงสิทธิ์เฉพาะเจ้าของ) */}
                                        {isOwnProfile && (
                                            <Link 
                                                href={route('profile.edit')} 
                                                aria-label="แก้ไขการตั้งค่าโปรไฟล์" 
                                                // 🌟 [Lighthouse A11y] ขยาย Touch Target ด้วย min-h-[44px]
                                                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold transition-all text-sm min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                <span aria-hidden="true" className="mr-2">⚙️</span> 
                                                ตั้งค่าโปรไฟล์
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ส่วนล่าง: กิจกรรมและรายการโพสต์ (User Activity Feed) */}
                    <section aria-labelledby="activity-feed" className="space-y-6">
                        <header className="flex items-center justify-between px-2">
                            <h3 id="activity-feed" className="font-bold text-gray-700 text-lg border-l-4 border-indigo-500 pl-3">
                                โพสต์ล่าสุด
                            </h3>
                            <span className="text-sm text-gray-700 font-bold bg-gray-200 px-4 py-1.5 rounded-full" aria-label={`จำนวนโพสต์ทั้งหมด ${posts.length} โพสต์`}> 
                                {posts?.length} โพสต์
                            </span>
                        </header>
                        
                        {/* แสดงผลรายการโพสต์ (Dynamic Rendering)
                          - มีโพสต์: ทำซ้ำ (Map) เข้าสู่คอมโพเนนต์ PostItem 
                          - ไม่มีโพสต์: แสดงสถานะว่างเปล่า (Empty State) 
                        */}
                        <div className="space-y-4">
                            {posts?.length > 0 ? (
                                posts?.map((post, index) => <PostItem key={post?.id || index} post={post} auth={auth} isFirst={index === 0} />)
                            ) : (
                                <div className="bg-white p-16 text-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-500 flex flex-col items-center justify-center"> 
                                    <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-lg font-medium text-gray-600">ยังไม่มีประวัติการทำกิจกรรม</p>
                                    <p className="text-sm text-gray-400 mt-1">ผู้ใช้นี้ยังไม่ได้เริ่มต้นแบ่งปันเรื่องราวใดๆ</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
