FROM php:8.3-apache

# ติดตั้ง System Dependencies สำหรับ PostgreSQL และ PHP extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql zip

# เปิดใช้งาน Apache Rewrite Module
RUN a2enmod rewrite

# ตั้งค่า Working Directory
WORKDIR /var/www/html

# คัดลอกไฟล์ทั้งหมดในโปรเจกต์เข้าไป
COPY . .

# ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# ติดตั้ง Node.js และ Build Frontend Assets
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install \
    && npm run build

# ตั้งค่าสิทธิ์ให้ Laravel Storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# ชี้ Apache Document Root ไปที่โฟลเดอร์ public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 80

# สั่งให้รัน Migration และเริ่ม Apache
CMD php artisan migrate --force && apache2-foreground