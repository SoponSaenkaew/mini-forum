FROM php:8.4-apache

# 1. ติดตั้งส่วนเสริมที่จำเป็นสำหรับ Laravel, PostgreSQL และ Filament (intl)
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

# 2. เปิดใช้งาน mod_rewrite สำหรับ URL ของ Laravel
RUN a2enmod rewrite

# 3. ตั้งค่า Apache ให้รองรับโฟลเดอร์ public/ และแก้ไขปัญหา 404
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 4. ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. กำหนดโฟลเดอร์ทำงานและนำโค้ดทั้งหมดใส่ลงไป
WORKDIR /var/www/html
COPY . .

# 6. ติดตั้ง Package และ Build ไฟล์ React หน้าบ้าน
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# 7. ตั้งสิทธิ์ให้ระบบสามารถเขียนไฟล์ Cache และ Log ได้
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 8. เปิดพอร์ต 80
EXPOSE 80