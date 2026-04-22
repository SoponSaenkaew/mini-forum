FROM php:8.4-apache

# 1. ติดตั้งส่วนเสริมที่จำเป็น
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    unzip \
    git \
    nodejs \
    npm \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo_pgsql zip intl

# 2. เปิดใช้งาน mod_rewrite
RUN a2enmod rewrite

# 3. ตั้งค่า Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 4. ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. กำหนดโฟลเดอร์ทำงาน
WORKDIR /var/www/html
COPY . .

# 6. ติดตั้ง Package (แก้ปัญหา Error Code 1)
# --- ปรับจุดนี้ค่ะ: ใช้ --no-scripts เพื่อไม่ให้มันระเบิดตอน Build ---
RUN composer install --no-dev --optimize-autoloader --no-scripts
RUN npm install --legacy-peer-deps
RUN npm run build

# 7. เตรียมระบบให้พร้อม (บังคับสร้างแคชใหม่)
# --- เพิ่มจุดนี้ค่ะ: สร้างไฟล์ .env ชั่วคราวเพื่อให้ artisan รันได้ ---
RUN cp .env.example .env && \
    php artisan package:discover --ansi && \
    php artisan optimize:clear

# 8. ตั้งสิทธิ์การเข้าถึงไฟล์
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. เปิดพอร์ต 80
EXPOSE 80

# 10. สั่งรันคำสั่งสำคัญก่อนเริ่มงาน
# --- เคลียร์แคชอีกรอบเพื่อให้ค่าจาก Render Environment ทำงาน ---
CMD php artisan optimize:clear && php artisan migrate --force && apache2-foreground