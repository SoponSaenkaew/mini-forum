import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateAvatarForm from './Partials/UpdateAvatarForm';
import UpdateCoverPhotoForm from './Partials/UpdateCoverPhotoForm';

/**
 * @component ProfileEdit
 * @description หน้าตั้งค่าโปรไฟล์ของผู้ใช้งาน (Profile Settings)
 * ปรับปรุง UX ด้วยระบบนำทางด้านข้าง และปรับแก้ Accessibility (A11y) 
 * ให้ใช้ <nav> และแท็ก <a> เพื่อให้รองรับ Screen Reader อย่างสมบูรณ์ 100/100
 */
export default function Edit({ mustVerifyEmail, status, auth }) {
    
    /**
     * @function scrollToSection
     * @description ฟังก์ชันเลื่อนหน้าจอไปยัง Section ที่ต้องการอย่างนุ่มนวล
     */
    const scrollToSection = (e, id) => {
        e.preventDefault(); // ป้องกันไม่ให้ URL เปลี่ยนแปลงกะทันหัน
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ตั้งค่าโปรไฟล์ (Profile Settings)
                </h2>
            }
        >
            <Head>
                <title>ตั้งค่าโปรไฟล์ - Tuna Forum</title>
                <meta name="description" content="จัดการข้อมูลส่วนตัว อัปเดตโปรไฟล์ และตั้งค่าความปลอดภัยสำหรับบัญชีของคุณ" />
            </Head>

            <main className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
                    
                    {/* 🌟 [Lighthouse A11y] เปลี่ยน aside เป็น nav และระบุ aria-label เพื่อให้ Screen Reader รู้ว่าเป็นเมนูนำทาง */}
                    <nav aria-label="เมนูตั้งค่าโปรไฟล์" className="md:w-1/4 shrink-0 space-y-2 sticky top-24 self-start hidden md:block">
                        {/* 🌟 ปรับสีเทาให้เข้มขึ้นเป็น 600 เพื่อผ่านเกณฑ์ Contrast */}
                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 px-3">เมนูตั้งค่า</h3>
                        
                        {/* 🌟 [Lighthouse A11y] เปลี่ยน button เป็น <a> พร้อมระบุ href เพื่อให้ถูกต้องตามหลัก Semantic HTML */}
                        <a 
                            href="#section-avatar" 
                            onClick={(e) => scrollToSection(e, 'section-avatar')} 
                            className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            รูปโปรไฟล์
                        </a>
                        <a 
                            href="#section-cover" 
                            onClick={(e) => scrollToSection(e, 'section-cover')} 
                            className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            รูปหน้าปก
                        </a>
                        <a 
                            href="#section-info" 
                            onClick={(e) => scrollToSection(e, 'section-info')} 
                            className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            ข้อมูลส่วนตัว
                        </a>
                        <a 
                            href="#section-password" 
                            onClick={(e) => scrollToSection(e, 'section-password')} 
                            className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            ความปลอดภัย (รหัสผ่าน)
                        </a>
                        <a 
                            href="#section-danger" 
                            onClick={(e) => scrollToSection(e, 'section-danger')} 
                            className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all mt-4 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                            ลบบัญชีผู้ใช้งาน
                        </a>
                    </nav>

                    {/* --- พื้นที่แสดงฟอร์มหลัก (Main Forms Area) --- */}
                    <div className="flex-1 space-y-8">
                        
                        <section id="section-avatar" aria-label="อัปเดตรูปโปรไฟล์" className="bg-white p-6 shadow-sm sm:rounded-3xl border border-gray-100 scroll-mt-24">
                            <UpdateAvatarForm 
                                currentAvatar={auth.user.avatar_url} 
                                className="max-w-xl" 
                            />
                        </section>
                        
                        <section id="section-cover" aria-label="อัปเดตภาพหน้าปก" className="bg-white p-6 shadow-sm sm:rounded-3xl border border-gray-100 scroll-mt-24">
                            <UpdateCoverPhotoForm 
                                currentCover={auth.user.cover_photo_url} 
                            />
                        </section>
                        
                        <section id="section-info" aria-label="อัปเดตข้อมูลส่วนตัว" className="bg-white p-6 shadow-sm sm:rounded-3xl border border-gray-100 scroll-mt-24">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </section>

                        <section id="section-password" aria-label="เปลี่ยนรหัสผ่าน" className="bg-white p-6 shadow-sm sm:rounded-3xl border border-gray-100 scroll-mt-24">
                            <UpdatePasswordForm className="max-w-xl" />
                        </section>

                        {/* โซนอันตราย (Danger Zone) */}
                        <section id="section-danger" aria-label="ลบบัญชีผู้ใช้งาน" className="bg-rose-50/30 p-6 shadow-sm sm:rounded-3xl border border-rose-100 scroll-mt-24">
                            <DeleteUserForm className="max-w-xl" />
                        </section>
                        
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
