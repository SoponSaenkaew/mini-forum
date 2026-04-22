<div align="center">

# 🚀 Mini Forum

**A Modern Community Platform built with Laravel 11, React (Inertia), and PostgreSQL**

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Deployment-46E3B7?style=for-the-badge&logo=render)](https://render.com/)

ระบบคอมมูนิตี้ฟีด / เว็บบอร์ดขนาดย่อมที่เน้นความรวดเร็วและประสบการณ์ผู้ใช้ (UX) ที่ลื่นไหลเหมือน SPA  
พร้อมระบบฝากรูปภาพบน Cloud และการทำงานแบบ Real-time ขับเคลื่อนด้วย Docker บน WSL

</div>

---

# ✨ Key Features (ฟีเจอร์เด่น)

- **💬 Infinity Nested Comments** — ระบบคอมเมนต์ซ้อนกันได้ไม่จำกัดชั้น เพื่อการสนทนาที่ลึกซึ้ง
- **⚡ Real-time Notifications** — แจ้งเตือนทันทีเมื่อมีการโต้ตอบด้วยเทคโนโลยี WebSockets (`Laravel Reverb`)
- **🖼️ Cloud Asset Management** — ระบบจัดการรูปภาพโปรไฟล์และโพสต์ผ่าน `Supabase Storage` (S3 Compatible)
- **❤️ Polymorphic Likes** — สถาปัตยกรรม Database ที่ยืดหยุ่น รองรับการกดไลก์ได้ทั้งระดับ Post และ Comment
- **🛠️ Powerful Admin Panel** — จัดการเนื้อหา สมาชิก และสถิติผ่าน Dashboard ด้วย `Filament PHP v3`
- **🔒 Robust Security** — ระบบสมาชิกและการจัดการเซสชันที่ปลอดภัยผ่าน `Laravel Sanctum`

---

# 🛠️ Tech Stack

## Backend & Frontend

- **PHP 8.4** (Containerized)
- **Laravel 11**
- **React 18 + Inertia.js**
- **Tailwind CSS**
- **Filament PHP 3.2** (Admin Panel)

## Infrastructure & Storage

- **Docker (Laravel Sail)** สำหรับจำลอง Environment ให้เหมือนกันทุกเครื่อง
- **PostgreSQL 18** (Primary Database)
- **Redis** (Caching & Sessions)
- **Supabase Storage** สำหรับเก็บ Assets บน Cloud เพื่อความเสถียรระดับ Production
- **Render** สำหรับ Deploy ระบบขึ้น Cloud

---

# 💻 การติดตั้งและการรันโปรเจกต์ (Local Development)

## 📌 สิ่งที่ต้องเตรียม

1. [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) (สำหรับ Windows Users)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 🚀 ขั้นตอนการติดตั้ง

### 1. Clone Project & Install Dependencies

```bash
git clone <your-repository-url>
cd mini-forum

# ติดตั้ง Composer dependencies ผ่าน Container ชั่วคราว
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

---

### 2. Environment Configuration

```bash
cp .env.example .env
```

> **Note:**  
> หากต้องการใช้งานระบบอัปโหลดรูปภาพผ่าน Supabase  
> ต้องตั้งค่า `FILESYSTEM_DISK=supabase`  
> และระบุค่า `SUPABASE_STORAGE_URL`, `SUPABASE_STORAGE_KEY` ในไฟล์ `.env`

---

### 3. Start Containers & Setup Database

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan storage:link
```

---

### 4. Frontend & Background Services

เปิด Terminal 3 หน้าต่าง เพื่อรัน Service ต่อไปนี้:

#### Terminal 1 — Vite Dev Server

```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

#### Terminal 2 — WebSocket Server (Reverb)

```bash
./vendor/bin/sail artisan reverb:start --host=0.0.0.0 --port=8081
```

#### Terminal 3 — Queue Worker

```bash
./vendor/bin/sail artisan queue:work
```

---

# 🚀 Production Deployment (Render)

โปรเจกต์นี้ได้รับการปรับแต่งเพื่อรองรับการ Deploy ผ่าน Docker บน Render อย่างสมบูรณ์

- **Dockerfile Optimized** — จัดการ Permission ของโฟลเดอร์ `storage` และ `cache` โดยอัตโนมัติ
- **Secure Asset Delivery** — บังคับใช้งาน HTTPS และจัดการ Mixed Content ผ่าน `AppServiceProvider`
- **Hybrid URL Generation** — ระบบ Accessors ใน Model จะสลับ URL ระหว่าง Local และ Cloud อัตโนมัติ

---

# 🌐 การเข้าใช้งาน (Default Accounts)

## Main Application

```text
http://localhost
```

## Admin Panel

```text
http://localhost/admin
```

## Default Accounts

### Admin Account

```text
Email: admin@example.com
Password: password
```

### Test User

```text
Email: user@example.com
Password: password
```

---

<div align="center">

<em>Developed with ❤️ by SoponSaenkaew</em>

</div>
