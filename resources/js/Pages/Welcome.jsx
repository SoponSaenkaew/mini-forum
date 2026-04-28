import { Link, Head } from '@inertiajs/react';
import { useMemo } from 'react';

/**
 * @component PostCard
 * @description คอมโพเนนต์สำหรับแสดงผลข้อมูลโพสต์แบบย่อ (Thumbnail View) 
 * 🌟 [อัปเดต] ใช้ระบบล้าง HTML เพื่อป้องกันตัวอักษรซ้อนทับเวลาใช้ line-clamp
 */
const PostCard = ({ post }) => {
    // 🌟 ดึงโค้ด HTML ออกให้เหลือแต่ข้อความธรรมดา เพื่อให้ line-clamp ทำงานได้ 100%
    const plainTextContent = useMemo(() => {
        if (!post.content) return "";
        return post.content
            .replace(/<\/p>/gi, ' ')      // เปลี่ยนการจบพารากราฟเป็นเว้นวรรค
            .replace(/<br\s*\/?>/gi, ' ') // เปลี่ยนการขึ้นบรรทัดใหม่เป็นเว้นวรรค
            .replace(/<[^>]*>?/gm, '')    // ล้าง Tag HTML ทั้งหมดทิ้ง!
            .replace(/&nbsp;/gi, ' ')     // แปลงสัญลักษณ์เว้นวรรคของ HTML กลับเป็นช่องว่าง
            .trim();
    }, [post.content]);

    return (
        <article className="text-left rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden group focus-within:ring-4 focus-within:ring-indigo-500/50">
            
            {/* 🌟 คลุมด้วย Link ทั้งแผง! กดตรงไหนก็ไปหน้าอ่านโพสต์แน่นอน 100% */}
            <Link 
                href={route('posts.show', post.id)} 
                className="flex flex-col h-full w-full focus:outline-none"
            >
                {/* ส่วนแสดงรูปภาพหน้าปก (Thumbnail) */}
                {post.images?.[0] && (
                    <div className="relative w-full aspect-video bg-gray-50 overflow-hidden">
                        <img 
                            src={post.images[0].image_url} 
                            alt={`ภาพประกอบเนื้อหาของ ${post.user.name}`} 
                            loading="lazy"
                            decoding="async"
                            width="400"
                            height="225"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                )}
                
                {/* ส่วนรายละเอียดโพสต์ (Post Details) */}
                <div className="p-5 flex flex-col flex-1">
                    <header className="mb-2">
                        <p className="font-bold text-indigo-600 text-xs">@{post.user.name}</p>
                        <time className="text-[10px] text-gray-500 block font-medium" dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString('th-TH')}
                        </time>
                    </header>
                    
                    {/* 🔍 แสดงข้อความธรรมดา (Plain Text) พร้อมระบบ line-clamp ที่ทำงานได้อย่างสมบูรณ์ */}
                    <p className="text-gray-700 line-clamp-3 mb-4 text-sm leading-relaxed flex-1">
                        {plainTextContent}
                    </p>
                    
                    {/* แถบข้อมูลสรุป (Metrics Footer) */}
                    <footer className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-gray-50">
                        <span className="flex items-center gap-1" aria-label={`มีผู้ถูกใจโพสต์นี้ ${post.likes.length} คน`}>
                            <svg className="w-3.5 h-3.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            {post.likes.length} LIKES
                        </span>
                        
                        {post.images?.length > 1 && (
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600" aria-label={`มีรูปภาพเพิ่มเติมอีก ${post.images.length - 1} รูป`}>
                                +{post.images.length - 1} IMAGES
                            </span>
                        )}
                    </footer>
                </div>
            </Link>
        </article>
    );
};

/**
 * @component Welcome
 * @description หน้าแรก (Landing Page) ของระบบ Tuna Forum 
 */
export default function Welcome({ auth, latestPosts }) {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-indigo-500 selection:text-white flex flex-col">
            <Head title="ยินดีต้อนรับสู่ Tuna Forum" />

            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full" aria-label="เมนูหลัก">
                <div className="text-2xl font-black text-indigo-600 tracking-tighter">
                    TUNA FORUM <span className="text-gray-200" aria-hidden="true">/</span>
                </div>
                <div className="flex items-center gap-6">
                    {auth.user ? (
                        <Link 
                            href={route('dashboard')} 
                            className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            แผงควบคุม (Dashboard)
                        </Link>
                    ) : (
                        <Link 
                            href={route('login')} 
                            className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            เข้าสู่ระบบ (Login)
                        </Link>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 flex-1 flex flex-col items-center">
                
                <header className="pt-12 pb-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight text-gray-900">
                        แบ่งปันไอเดีย <br /> 
                        <span className="text-indigo-600 relative inline-block">
                            ให้โลกได้รับรู้
                            <div className="absolute bottom-2 left-0 w-full h-3 bg-indigo-50 -z-10 rounded-full" aria-hidden="true"></div>
                        </span>
                    </h1>
                    <p className="max-w-lg mx-auto text-base text-gray-600 font-medium mb-8">
                        แพลตฟอร์มเชื่อมต่อทุกความคิดสร้างสรรค์และเรื่องราวที่น่าสนใจของคุณ
                    </p>
                    <Link 
                        href={auth.user ? route('dashboard') : route('register')} 
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold inline-block hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 min-h-[56px] min-w-[200px]"
                    >
                        {auth.user ? 'ไปยังฟีดของคุณ (Go to Feed) →' : 'เริ่มต้นใช้งานฟรี (Get Started)'}
                    </Link>
                </header>

                <section className="mt-8 mb-20 w-full" aria-labelledby="trending-heading">
                    <header className="flex flex-col items-center mb-8">
                        <div className="h-1.5 w-10 bg-indigo-600 mb-3 rounded-full" aria-hidden="true"></div>
                        <h2 id="trending-heading" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                            กิจกรรมล่าสุด (Trending Activity) 💬
                        </h2>
                    </header>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {latestPosts.length > 0 ? (
                            latestPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-gray-500 font-medium text-sm">
                                ยังไม่มีข้อมูลการทำกิจกรรมในขณะนี้
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer className="py-8 text-center border-t border-gray-50">
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                    &copy; 2026 Tuna Forum Project • พัฒนาโดย PhieTao
                </p>
            </footer>
        </div>
    );
}