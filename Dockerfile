FROM php:8.4-apache

# 1. ติดตั้ง System Dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    libicu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo pdo_pgsql zip intl

# 2. เปิดใช้งาน Apache Rewrite Module
RUN a2enmod rewrite

# 3. ตั้งค่า Working Directory
WORKDIR /var/www/html

# 4. คัดลอกไฟล์โปรเจกต์
COPY . .

# 5. ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# --- แก้ไขส่วนที่ 6 ตรงนี้ค่ะ ---
# 6. รับค่า Argument จาก Render เพื่อใช้ตอน Build Frontend
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER

# ติดตั้ง Node.js และ Build Frontend Assets 
# โดยส่งค่า ARG เข้าไปให้ npm run build มองเห็นตัวแปร VITE_
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install --legacy-peer-deps \
    && VITE_PUSHER_APP_KEY=${VITE_PUSHER_APP_KEY} \
       VITE_PUSHER_APP_CLUSTER=${VITE_PUSHER_APP_CLUSTER} \
       npm run build
# ------------------------------

# 7. ตั้งค่าสิทธิ์ไฟล์
RUN php artisan storage:link \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/storage
# 8. ตั้งค่า Apache Document Root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN php artisan storage:link

EXPOSE 80

# 9. Migrate และเริ่ม Apache
CMD php artisan migrate --force && apache2-foreground

