import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

/**
 * @component AuthenticatedLayout
 * @description เลย์เอาต์หลักสำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว (Authenticated)
 * ทำหน้าที่จัดการระบบนำทางหลัก (Navigation) ข้อมูลผู้ใช้งาน และการรับการแจ้งเตือนแบบเรียลไทม์ (Real-time Notifications)
 * * @param {Object} props
 * @param {React.ReactNode} props.header - ส่วนหัวของหน้าเพจ (Page Header)
 * @param {React.ReactNode} props.children - เนื้อหาหลักของหน้าเพจ
 */
export default function AuthenticatedLayout({ header, children }) {
    /**
     * ดึงข้อมูลผู้ใช้งานปัจจุบันจาก Inertia Page Props
     */
    const user = usePage().props.auth.user;

    /**
     * สถานะสำหรับการจัดการ UI
     * @state {boolean} isVisible - ควบคุมการแสดงผลของแถบนำทาง (Navbar) ซ่อนเมื่อเลื่อนลง แสดงเมื่อเลื่อนขึ้น
     * @state {boolean} showingNavigationDropdown - ควบคุมการแสดงผลเมนูนำทางบนหน้าจอขนาดเล็ก (Mobile)
     */
    const [isVisible, setIsVisible] = useState(true);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    /**
     * อ้างอิงตำแหน่งการเลื่อนหน้าจอล่าสุด เพื่อคำนวณทิศทางการเลื่อน (Scroll Direction)
     */
    const lastScrollY = useRef(0);

    /**
     * การจัดการ Real-time Notifications ผ่าน Laravel Echo
     * เชื่อมต่อกับ Private Channel ของผู้ใช้งานเพื่อดักฟังการแจ้งเตือนใหม่
     */
    useEffect(() => {
        const channelName = `App.Models.User.${user.id}`;
        window.Echo.private(channelName)
            .notification((notification) => {
                console.log('รับการแจ้งเตือนใหม่:', notification);
                // โหลดข้อมูลคอมโพเนนต์ใหม่โดยรักษาตำแหน่งการเลื่อนหน้าจอและสถานะเดิมไว้
                router.reload({ 
                    only: ['auth'], 
                    preserveScroll: true, 
                    preserveState: true 
                });
            });

        // ยกเลิกการเชื่อมต่อเมื่อคอมโพเนนต์ถูกทำลาย (Unmount) เพื่อป้องกัน Memory Leak
        return () => window.Echo.leave(channelName);
    }, [user.id]);

    /**
     * การจัดการ Sticky & Auto-hide Navbar
     * ตรวจจับการเลื่อนหน้าจอเพื่อซ่อน Navbar เมื่อเลื่อนลง และแสดงกลับมาเมื่อเลื่อนขึ้น
     */
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                // หากเลื่อนลงเกิน 100px ให้ซ่อน Navbar
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', controlNavbar, { passive: true });
        return () => window.removeEventListener('scroll', controlNavbar);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <nav className={`fixed top-0 z-50 w-full border-b border-gray-100 bg-white transition-transform duration-300 ease-in-out ${
                isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* บริเวณโลโก้แอปพลิเคชัน */}
                            <div className="flex shrink-0 items-center">
                                <Link 
                                    href="/" 
                                    className="text-2xl font-black tracking-wider text-gray-800 uppercase"
                                >
                                    TUNA FORUM
                                </Link>
                            </div>

                            {/* ลิงก์นำทางสำหรับหน้าจอขนาดใหญ่ (Desktop Navigation) */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        {/* เมนูผู้ใช้งานมุมขวาบน (User Dropdown Menu) */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                <span className="relative inline-flex items-center">
                                                    {/* รูปโปรไฟล์ผู้ใช้งาน (User Avatar) */}
                                                    {user.avatar_url ? (
                                                        <img 
                                                            src={`${user.avatar_url}?t=${new Date().getTime()}`} // ป้องกันการแคชรูปภาพเก่า
                                                            className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-200" 
                                                            alt={user.name}
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold mr-2 shadow-sm">
                                                            {user.name[0]}
                                                        </div>
                                                    )}
                                                    
                                                    {user.name}

                                                    {/* ตัวแสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน (Unread Notifications Badge) */}
                                                    {user.unread_notifications_count > 0 && (
                                                        <Link 
                                                            href={route('notifications.index')}
                                                            className="ms-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm hover:bg-red-600 transition"
                                                        >
                                                            {user.unread_notifications_count > 99 ? '99+' : user.unread_notifications_count}
                                                        </Link>
                                                    )}
                                                </span>

                                                {/* ไอคอนลูกศรชี้ลง */}
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.show', user.id)}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('notifications.index')}>
                                            Notifications
                                        </Dropdown.Link>

                                        {/* แสดงเมนู Admin Panel เฉพาะผู้ดูแลระบบเท่านั้น */}
                                        {user.is_admin && (
                                            <a href="/admin" className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out">
                                                Admin Panel
                                            </a>
                                        )}
                                        
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* ปุ่มเปิด/ปิดเมนูสำหรับหน้าจอขนาดเล็ก (Mobile Hamburger Button) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <div className="relative">
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    
                                    {/* จุดสีแดงแจ้งเตือนบนไอคอนเมนู (Notification Indicator for Mobile) */}
                                    {!showingNavigationDropdown && user.unread_notifications_count > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* เมนูนำทางสำหรับหน้าจอขนาดเล็ก (Mobile Navigation Menu) */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('notifications.index')} active={route().current('notifications.index')}>
                            Notifications ({user.unread_notifications_count})
                        </ResponsiveNavLink>
                    </div>

                    {/* ข้อมูลผู้ใช้งานบนหน้าจอขนาดเล็ก (Mobile User Info) */}
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="flex items-center px-4">
                            <div className="shrink-0">
                                {user.avatar_url ? (
                                    <img 
                                        src={`${user.avatar_url}?t=${new Date().getTime()}`}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                        alt={user.name}
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                        {user.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.show', user.id)}>Profile</ResponsiveNavLink>
                            {user.is_admin && (
                                <ResponsiveNavLink href="/admin">Admin Panel</ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* พื้นที่เนื้อหาหลัก (Main Content Area) */}
            <div className="pt-16">
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <main>{children}</main>
            </div>
        </div>
    );
}