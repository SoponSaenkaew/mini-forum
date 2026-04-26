import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

/**
 * @component AuthenticatedLayout
 * @description เลย์เอาต์หลักสำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว (Authenticated Layout)
 * ควบคุมระบบนำทาง (Navigation), แถบค้นหาส่วนกลาง, การเชื่อมต่อ WebSockets (Laravel Echo) 
 * และได้รับการปรับแต่งสถาปัตยกรรม UI ให้สอดคล้องกับมาตรฐาน Lighthouse (Performance & Accessibility)
 */
export default function AuthenticatedLayout({ header, children }) {
    // ดึงข้อมูล Global Props และสถานะผู้ใช้งานจาก Inertia.js
    const { auth, filters } = usePage().props;
    const user = auth.user;

    // ==========================================
    // 1. การจัดการสถานะ (State Management)
    // ==========================================
    const [isVisible, setIsVisible] = useState(true);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    /** @state {string} searchQuery - จัดเก็บคำค้นหาและเชื่อมโยงกับ Query Parameters */
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const lastScrollY = useRef(0);

    // ==========================================
    // 2. ฟังก์ชันจัดการเหตุการณ์ (Event Handlers)
    // ==========================================
    
    /**
     * @function handleSearch
     * @description ดำเนินการค้นหาข้อมูลโดยการรีโหลดเฉพาะส่วน (Partial Reload) ผ่าน Inertia
     * @param {Event} e - Form Submission Event
     */
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), 
            { search: searchQuery }, 
            { preserveState: true, replace: true }
        );
    };

    // ==========================================
    // 3. การเชื่อมต่อข้อมูลแบบเรียลไทม์ (Real-time Integration)
    // ==========================================
    
    useEffect(() => {
        const privateChannel = `App.Models.User.${user.id}`;
        
        // ติดตามการแจ้งเตือนส่วนบุคคล (Private Notifications)
        window.Echo.private(privateChannel).notification(() => handleReload());
        
        // ติดตามการอัปเดตฟีดสาธารณะ (Public Feed Events)
        window.Echo.channel('public-feed').listen('.FeedUpdated', () => handleReload());

        const handleReload = () => router.reload({ only: ['auth'], preserveScroll: true });

        // ยกเลิกการเชื่อมต่อเมื่อคอมโพเนนต์ถูกทำลาย (Cleanup / Unmount)
        return () => {
            window.Echo.leave(privateChannel);
            window.Echo.leave('public-feed');
        };
    }, [user.id]);

    // ==========================================
    // 4. การจัดการพฤติกรรมหน้าจอ (Scroll Behavior)
    // ==========================================
    
    useEffect(() => {
        /**
         * @function controlNavbar
         * @description ควบคุมการแสดง/ซ่อนแถบนำทางอัตโนมัติตามทิศทางการเลื่อนหน้าจอ
         */
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        
        // ใช้ { passive: true } เพื่อไม่ให้กีดขวางประสิทธิภาพการเลื่อนหน้าจอ (Scrolling Performance)
        window.addEventListener('scroll', controlNavbar, { passive: true });
        return () => window.removeEventListener('scroll', controlNavbar);
    }, []);

    // ==========================================
    // 5. การแสดงผล (Render)
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* แถบนำทางหลัก (Main Navigation) */}
            <nav 
                aria-label="เมนูนำทางหลัก" 
                className={`fixed top-0 z-50 w-full border-b border-gray-100 bg-white transition-transform duration-300 ${
                isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center gap-4">
                        
                        {/* ส่วนแสดงโลโก้และช่องค้นหา (Desktop) */}
                        <div className="flex items-center flex-1">
                            <Link href="/" aria-label="กลับสู่หน้าแรก" className="text-xl font-black text-indigo-600 uppercase tracking-tighter focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1">
                                TUNA
                            </Link>

                            {/* ลิงก์นำทางสำหรับหน้าจอขนาดใหญ่ (Desktop Navigation) */}
                            <div className="hidden space-x-6 sm:-my-px sm:ms-8 sm:flex">
                                <NavLink href="/">
                                    หน้าหลัก
                                </NavLink>
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>

                            {/* ฟอร์มค้นหาสำหรับหน้าจอขนาดใหญ่ */}
                            <div className="hidden md:flex ml-8 flex-1 max-w-md">
                                <form onSubmit={handleSearch} className="relative w-full">
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ค้นหาโพสต์ หรือชื่อผู้ใช้..."
                                        aria-label="ช่องค้นหา"
                                        className="w-full bg-gray-100 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button type="submit" aria-label="ดำเนินการค้นหา" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                                        🔍
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* เมนูผู้ใช้และการแจ้งเตือน (User & Notification Actions) */}
                        <div className="hidden sm:flex items-center gap-3">
                            <Link 
                                href={route('notifications.index')} 
                                aria-label={`การแจ้งเตือน ${user.unread_notifications_count > 0 ? `ใหม่ ${user.unread_notifications_count} รายการ` : 'ทั้งหมด'}`}
                                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {user.unread_notifications_count > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                                        {user.unread_notifications_count > 99 ? '99+' : user.unread_notifications_count}
                                    </span>
                                )}
                            </Link>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button 
                                        aria-haspopup="true"
                                        aria-label="เปิดเมนูบัญชีผู้ใช้งาน"
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url} 
                                                loading="lazy" 
                                                decoding="async"
                                                // 🌟 [Lighthouse] กำหนดขนาดภาพเพื่อป้องกัน Cumulative Layout Shift (CLS)
                                                width="32" 
                                                height="32"
                                                className="h-8 w-8 rounded-full object-cover border" 
                                                alt={`รูปโปรไฟล์ของ ${user.name}`} 
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">{user.name[0]}</div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700 hidden lg:inline">{user.name}</span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.show', user.id)}>หน้าโปรไฟล์ (Profile)</Dropdown.Link>
                                    <Dropdown.Link href={route('profile.edit')}>การตั้งค่า (Settings)</Dropdown.Link>
                                    {user.is_admin && <Dropdown.Link href="/admin">แผงควบคุม (Admin Panel)</Dropdown.Link>}
                                    <Dropdown.Link href={route('logout')} method="post" as="button">ออกจากระบบ (Log Out)</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* ปุ่มเปิดเมนูสำหรับหน้าจอขนาดเล็ก (Mobile Hamburger Menu) */}
                        <div className="sm:hidden flex items-center">
                            <button 
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} 
                                aria-label={showingNavigationDropdown ? "ปิดเมนูนำทาง" : "เปิดเมนูนำทาง"}
                                aria-expanded={showingNavigationDropdown}
                                className="p-2 text-gray-500 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md flex items-center justify-center"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* แผงเมนูและค้นหาสำหรับหน้าจอขนาดเล็ก (Mobile Navigation Panel) */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-white border-t'}>
                    
                    <div className="p-4">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ค้นหา..."
                                aria-label="ช่องค้นหาสำหรับมือถือ"
                                className="w-full bg-gray-100 border-none rounded-lg py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </form>
                    </div>
                    
                    {/* ส่วนข้อมูลบัญชีผู้ใช้บนมือถือ (Mobile User Profile) */}
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="flex items-center px-4">
                            <div className="shrink-0">
                                {user.avatar_url ? (
                                    <img 
                                        src={user.avatar_url}
                                        loading="lazy" 
                                        decoding="async"
                                        // [Lighthouse] กำหนดขนาดภาพเพื่อป้องกัน CLS สำหรับมือถือ
                                        width="40"
                                        height="40"
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                        alt={`รูปโปรไฟล์ของ ${user.name}`} 
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold" aria-hidden="true">{user.name[0]}</div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="pb-3 space-y-1 mt-2">
                        <ResponsiveNavLink href="/">หน้าหลัก</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('profile.show', user.id)}>หน้าโปรไฟล์</ResponsiveNavLink>
                        {user.is_admin && <ResponsiveNavLink href="/admin">แผงควบคุม</ResponsiveNavLink>}
                        <ResponsiveNavLink href={route('logout')} method="post" as="button">ออกจากระบบ</ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            {/* พื้นที่สำหรับแสดงเนื้อหาหลัก (Main Content Area) */}
            <div className="pt-16 sm:pt-20">
                {header && (
                    <header className="bg-white shadow-sm border-b">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}
                <main>{children}</main>
            </div>
        </div>
    );
}
