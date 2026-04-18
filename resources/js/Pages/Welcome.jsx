// resources/js/Pages/Welcome.jsx
import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth, latestPosts }) {
    return (
        <>
            <Head title="ยินดีต้อนรับสู่ Sprite Shelf" />
            
            <div className="min-h-screen bg-white text-gray-900 selection:bg-indigo-500 selection:text-white">
                {/* --- Navbar --- */}
                <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                    <div className="text-2xl font-black text-indigo-600 tracking-tighter">
                        SPRITE SHELF <span className="text-gray-300">/</span>
                    </div>
                    <div className="space-x-4">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="font-bold text-sm hover:text-indigo-600 transition">เข้าสู่ระบบแล้ว (Dashboard)</Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="font-bold text-sm hover:text-indigo-600 transition">Login</Link>
                                <Link href={route('register')} className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Sign Up</Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* --- Hero Section --- */}
                <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
                        แชร์ไอเดีย <br /> 
                        <span className="text-indigo-600 underline decoration-indigo-200">ให้โลกได้รู้</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-gray-500 mb-10 leading-relaxed">
                        ยินดีต้อนรับสู่โปรเจกต์ Mini-forum ของเซนเซ! พื้นที่เล็กๆ สำหรับการพูดคุย แลกเปลี่ยน และสร้างสรรค์สังคมที่น่ารักไปด้วยกันค่ะ ✨
                    </p>
                    
                    <div className="flex gap-4">
                        <Link href={auth.user ? route('dashboard') : route('register')} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform">
                            {auth.user ? 'ไปที่ฟีดของคุณ' : 'เริ่มใช้งานฟรี'}
                        </Link>
                    </div>

                    {/* --- ส่วนโชว์โพสต์น้ำจิ้ม (Latest Activity) --- */}
                    <div className="mt-32 w-full">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-12">กระทู้ล่าสุดจากสมาชิก 💬</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {latestPosts.map((post) => (
                                <div key={post.id} className="text-left overflow-hidden rounded-3xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all bg-white flex flex-col">
                                    
                                    {/* ✨ ส่วนแสดงรูปภาพ: ถ้าโพสต์มีรูป ให้โชว์รูปแรกที่เจอ*/}
                                    {post.images && post.images.length > 0 && (
                                        <div className="w-full h-48 overflow-hidden bg-gray-100">
                                            <img 
                                                src={`/storage/${post.images[0].image_path}`} 
                                                alt="Post Preview" 
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <p className="font-bold text-indigo-600 mb-2">@{post.user.name}</p>
                                        <p className="text-gray-700 line-clamp-2 mb-4 h-12">{post.content}</p>
                                        
                                        <div className="flex justify-between items-center">
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                ❤️ {post.likes.length} Likes
                                            </div>
                                            {/* ถ้ามีหลายรูป ให้ขึ้นไอคอนบอกจำนวนรูปเล็กๆ */}
                                            {post.images.length > 1 && (
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                                    +{post.images.length - 1} images
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* --- Footer --- */}
                <footer className="py-10 text-center text-gray-400 text-xs border-t border-gray-50">
                    &copy; 2026 Sprite Shelf Project. Crafted with ❤️ by Sensei & Arona
                </footer>
            </div>
        </>
    );
}