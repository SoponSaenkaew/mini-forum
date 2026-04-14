import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState,useEffect } from 'react';


/**
 * @component AuthenticatedLayout
 * @description เลย์เอาต์หลักสำหรับหน้าที่ต้องผ่านการเข้าสู่ระบบ จัดการระบบนำทางและข้อมูลผู้ใช้
 */
export default function AuthenticatedLayout({ header, children }) {
    /**
     * ดึงข้อมูลผู้ใช้จาก Inertia Page Props
     * @property {number} unread_notifications_count - จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
     */
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    useEffect(() => {
        // ✨ ดักฟังช่องส่วนตัวของผู้ใช้ (Private Channel)
        window.Echo.private(`App.Models.User.${user.id}`)
            .notification((notification) => {
                console.log('🔔 มีแจ้งเตือนใหม่!', notification);
                // สั่งให้ Inertia ดึงข้อมูล auth ใหม่เพื่ออัปเดตตัวเลขแจ้งเตือนบนหัวเว็บ
                router.reload({ only: ['auth'], preserveScroll: true });
            });

        return () => window.Echo.leave(`App.Models.User.${user.id}`);
    }, [user.id]);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* ส่วนโลโก้ระบบ */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            {/* เมนูนำทางหลัก (Desktop) */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        {/* ส่วนข้อมูลผู้ใช้และการตั้งค่า (Desktop) */}
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
                                                    {user.name}
                                                    {/* ✨ เปลี่ยนจาก span เป็น Link เพื่อให้กดไปหน้าแจ้งเตือนได้ทันที */}
                                                    {user.unread_notifications_count > 0 && (
                                                        <Link 
                                                            href={route('notifications.index')}
                                                            className="ms-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm hover:bg-red-600 transition"
                                                        >
                                                            {user.unread_notifications_count > 99 ? '99+' : user.unread_notifications_count}
                                                        </Link>
                                                    )}
                                                </span>

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
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        
                                        {/* ✨ เพิ่มลิงก์ไปยังหน้าแจ้งเตือนทั้งหมด */}
                                        <Dropdown.Link href={route('notifications.index')}>
                                            Notifications
                                        </Dropdown.Link>

                                        {/* ลิงก์ไปหน้าแอดมินสำหรับผู้ที่มีสิทธิ์ */}
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

                        {/* ปุ่มเมนูสำหรับอุปกรณ์พกพา (Mobile Toggle) */}
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

                {/* เมนูนำทางสำหรับอุปกรณ์พกพา (Mobile Menu Content) */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        {/* ✨ เพิ่มเมนูแจ้งเตือนใน Mobile Nav */}
                        <ResponsiveNavLink href={route('notifications.index')} active={route().current('notifications.index')}>
                            Notifications ({user.unread_notifications_count})
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="flex items-center px-4">
                            <div className="flex-1">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
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

            {/* ส่วนหัวของหน้า (Header Section) */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* ส่วนเนื้อหาหลัก (Main Content) */}
            <main>{children}</main>
        </div>
    );
}