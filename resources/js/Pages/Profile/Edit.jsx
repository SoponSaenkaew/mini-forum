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
 * ทำหน้าที่รวบรวมและแสดงผลแบบฟอร์มสำหรับการตั้งค่าบัญชีทั้งหมด
 * ปรับปรุงโครงสร้าง DOM (Semantic HTML) ด้วยแท็ก <section> เพื่อมาตรฐานการเข้าถึง (Accessibility) ระดับสูงสุด
 *
 * @param {Object} props
 * @param {boolean} props.mustVerifyEmail - สถานะตรวจสอบว่าบังคับยืนยันอีเมลหรือไม่
 * @param {string} props.status - สถานะการแจ้งเตือนจากเซิร์ฟเวอร์
 * @param {Object} props.auth - ข้อมูลผู้ใช้งานปัจจุบัน
 */
export default function Edit({ mustVerifyEmail, status, auth }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ตั้งค่าโปรไฟล์ (Profile Settings)
                </h2>
            }
        >
            {/* 🌟 [Lighthouse SEO] เพิ่ม title และ meta description ให้ชัดเจน */}
            <Head>
                <title>ตั้งค่าโปรไฟล์ - Tuna Forum</title>
                <meta name="description" content="จัดการข้อมูลส่วนตัว อัปเดตโปรไฟล์ และตั้งค่าความปลอดภัยสำหรับบัญชีของคุณ" />
            </Head>

            <main className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    
                    {/* 🌟 [Lighthouse A11y] เปลี่ยน div เป็น section และเพิ่ม aria-label */}
                    <section aria-label="อัปเดตรูปโปรไฟล์" className="bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-gray-100">
                        <UpdateAvatarForm 
                            currentAvatar={auth.user.avatar_url} 
                            className="max-w-xl" 
                        />
                    </section>
                    
                    <section aria-label="อัปเดตภาพหน้าปก" className="bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-gray-100">
                        <UpdateCoverPhotoForm 
                            currentCover={auth.user.cover_photo_url} 
                        />
                    </section>
                    
                    <section aria-label="อัปเดตข้อมูลส่วนตัว" className="bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-gray-100">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </section>

                    <section aria-label="เปลี่ยนรหัสผ่าน" className="bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-gray-100">
                        <UpdatePasswordForm className="max-w-xl" />
                    </section>

                    <section aria-label="ลบบัญชีผู้ใช้งาน" className="bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-gray-100">
                        <DeleteUserForm className="max-w-xl" />
                    </section>
                    
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
