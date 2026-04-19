<div align="center">

# 🚀 Mini Forum

**A Modern Community Platform built with Laravel 11, React (Inertia), and PostgreSQL**

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge\&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge\&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge\&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker_Sail-2496ED?style=for-the-badge\&logo=docker)](https://www.docker.com/)

ระบบคอมมูนิตี้ฟีด / เว็บบอร์ดขนาดย่อม
ที่เน้นความรวดเร็วและประสบการณ์ผู้ใช้ (UX) ที่ลื่นไหลเหมือน SPA
พร้อมระบบโต้ตอบแบบ Real-time ขับเคลื่อนด้วยสถาปัตยกรรมคอนเทนเนอร์ (Docker) บน WSL

</div>

---

# ✨ Key Features (ฟีเจอร์เด่น)

* **💬 Infinity Nested Comments**
  ระบบคอมเมนต์ซ้อนกันได้ไม่จำกัดชั้น

* **⚡ Real-time Notifications**
  ระบบแจ้งเตือนทันทีเมื่อมีการโต้ตอบ
  ด้วยเทคโนโลยี WebSockets (`Laravel Reverb`)

* **❤️ Polymorphic Likes**
  สถาปัตยกรรม Database ที่รองรับการกดไลก์ได้ทั้งระดับ Post และ Comment

* **🛠️ Powerful Admin Panel**
  จัดการเนื้อหาและสถิติผ่าน Dashboard
  ด้วย `Filament PHP (v3)`

* **🔒 Robust Security**
  ระบบสมาชิกยืนยันตัวตนและการจัดการ API
  ผ่าน `Laravel Sanctum`

---

# 🛠️ Tech Stack

## Backend

* PHP 8.3+ (รันบน Container PHP 8.5)
* Laravel Framework 11
* Laravel Reverb (WebSocket Server)
* Filament PHP 3.2 (Admin Panel)

## Frontend

* React (Inertia.js)
* Tailwind CSS

## Infrastructure & Database

* Docker (Laravel Sail)
* PostgreSQL 18 (Primary Database)
* Redis (Caching & Sessions)

---

# 💻 การติดตั้งและการรันโปรเจกต์บน WSL (Ubuntu/Debian)

เนื่องจากโปรเจกต์นี้ใช้ **Laravel Sail (Docker)**
การติดตั้งบน Windows จึงแนะนำให้รันผ่าน **WSL 2**
เพื่อประสิทธิภาพสูงสุด และลดปัญหาเรื่อง Environment

---

## 📌 สิ่งที่ต้องเตรียม (Prerequisites)

1. ติดตั้ง [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) บน Windows

2. ติดตั้ง [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. เปิดใช้งาน **WSL Integration**
   และผูก Docker กับ Linux Distro ที่ใช้งาน
   (เช่น Ubuntu)

---

## 🚀 ขั้นตอนการติดตั้ง (Installation Steps)

### 1. Clone โปรเจกต์ลงใน WSL

เปิด Terminal ของ WSL (เช่น Ubuntu) แล้วรันคำสั่ง:

```bash
git clone <your-repository-url>
cd mini-forum
```

---

### 2. ติดตั้ง Composer Dependencies (ผ่าน Docker Container)

หากใน WSL ยังไม่มี PHP 8.3+
สามารถใช้ Container สำหรับติดตั้ง Composer dependencies ได้ทันที:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

---

### 3. ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env`

```bash
cp .env.example .env
```

> หมายเหตุ:
> ระบบฐานข้อมูลตั้งค่าเริ่มต้นเป็น PostgreSQL (Port 5432)
> และ Laravel Reverb ใช้ Port 8081

---

### 4. เริ่มต้น Docker Containers ด้วย Laravel Sail

สร้างและเปิดใช้งาน Containers ทั้งหมด:

* App
* PostgreSQL
* Redis

```bash
./vendor/bin/sail up -d
```

---

### 5. สร้าง Application Key และเตรียมฐานข้อมูล

```bash
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
```

---

### 6. ติดตั้งและ Build Frontend Dependencies

```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

> ให้ปล่อยหน้าต่าง Terminal นี้รันค้างไว้
> สำหรับ Hot Reload ของ Frontend

---

### 7. เปิดการทำงานของ WebSockets (Real-time Engine)

เปิด Terminal WSL ขึ้นมาอีก 1 หน้าต่าง แล้วรัน:

```bash
./vendor/bin/sail artisan reverb:start
```

---

# 🌐 การเข้าใช้งาน (Accessing the Application)

เมื่อระบบรันสมบูรณ์แล้ว
สามารถเข้าใช้งานผ่าน Browser บน Windows ได้ทันที

## Main Application

http://localhost

## Admin Panel

http://localhost/admin

## Additional Services

* Vite (Frontend Dev Server): Port 5173
* Reverb (WebSocket): Port 8081

---

# 🛑 การปิดระบบ (Stopping the Environment)

เมื่อต้องการหยุดการทำงาน:

1. กด `Ctrl + C`
   ในหน้าต่างที่รัน `npm` และ `reverb`

2. ปิด Docker Containers

```bash
./vendor/bin/sail down
```

---


<em>Developed with ❤️ by [Your Name]</em>

</div>
