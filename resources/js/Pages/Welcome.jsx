import { Link, Head } from '@inertiajs/react';

/**
 * @component PostCard
 * @description ส่วนแสดงผลกระทู้แบบย่อ พร้อมเอฟเฟกต์ยกตัวเล็กน้อยเมื่อ Hover
 */
const PostCard = ({ post }) => (
    <div className="text-left rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden flex flex-col group">
        {post.images?.[0] && (
            <div className="h-40 overflow-hidden bg-gray-100">
                <img 
                    src={`${post.images[0].image_url}?t=${Date.now()}`} 
                    alt="Post thumbnail" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
            </div>
        )}
        
        <div className="p-5">
            <p className="font-bold text-indigo-600 mb-1 text-xs">@{post.user.name}</p>
            <p className="text-gray-700 line-clamp-2 mb-4 text-sm leading-relaxed">{post.content}</p>
            
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1">❤️ {post.likes.length} LIKES</span>
                {post.images?.length > 1 && (
                    <span className="bg-gray-50 px-2 py-1 rounded-md">+{post.images.length - 1} IMAGES</span>
                )}
            </div>
        </div>
    </div>
);

export default function Welcome({ auth, latestPosts }) {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-indigo-500 selection:text-white flex flex-col">
            <Head title="ยินดีต้อนรับสู่ Tuna Forum" />

            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
                <div className="text-2xl font-black text-indigo-600 tracking-tighter">
                    TUNA FORUM <span className="text-gray-200">/</span>
                </div>
                <div className="flex items-center gap-6">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="text-sm font-bold hover:text-indigo-600 transition">Dashboard</Link>
                    ) : (
                        <Link href={route('login')} className="text-sm font-bold hover:text-indigo-600 transition">Login</Link>
                    )}
                </div>
            </nav>

            {/* --- Main Content Area --- */}
            <main className="max-w-7xl mx-auto px-6 flex-1 flex flex-col items-center">
                
                {/* Hero Section: ลด Padding และ Margin เพื่อดันเนื้อหาข้างล่างขึ้นมา */}
                <header className="pt-12 pb-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                        แชร์ไอเดีย <br /> 
                        <span className="text-indigo-600 relative inline-block">
                            ให้โลกได้รู้
                            <div className="absolute bottom-2 left-0 w-full h-3 bg-indigo-50 -z-10 rounded-full"></div>
                        </span>
                    </h1>
                    <p className="max-w-lg mx-auto text-base text-gray-400 font-medium mb-8">
                        เชื่อมต่อทุกความคิดสร้างสรรค์
                    </p>
                    <Link 
                        href={auth.user ? route('dashboard') : route('register')} 
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold inline-block hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        {auth.user ? 'ไปที่ฟีดของคุณ →' : 'เริ่มต้นใช้งานฟรี'}
                    </Link>
                </header>

                {/* Content Feed Section: เปลี่ยนจาก mt-40 เป็น mt-8 เพื่อให้โผล่พ้นขอบจอ (Above the fold) */}
                <section className="mt-8 mb-20 w-full">
                    <header className="flex flex-col items-center mb-8">
                        <div className="h-1.5 w-10 bg-indigo-600 mb-3 rounded-full"></div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Trending Activity 💬</h2>
                    </header>
                    
                    {/* แสดงรายการโพสต์ที่ตอนนี้จะเห็นหัวการ์ดโผล่ขึ้นมาแน่นอนค่ะ! */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {latestPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </section>
            </main>

            <footer className="py-8 text-center border-t border-gray-50">
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                    &copy; 2026 Tuna Forum Project • Crafted by PhieTao
                </p>
            </footer>
        </div>
    );
}
