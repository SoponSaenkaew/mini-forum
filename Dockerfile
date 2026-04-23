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

# 6. ติดตั้ง Package และประกอบร่าง (ข้ามจุดที่อาจจะ Error ตอน Build)
RUN composer install --no-dev --no-scripts --no-autoloader
RUN composer dump-autoload --optimize --no-scripts --no-dev

# 7. Build ไฟล์หน้าบ้าน
ARG VITE_BROADCAST_CONNECTION
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER

ENV VITE_BROADCAST_CONNECTION=$VITE_BROADCAST_CONNECTION
ENV VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY
ENV VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER

RUN npm install --legacy-peer-deps && npm run build

# 8. สร้างโฟลเดอร์ที่จำเป็นและมอบสิทธิ์ให้ www-data ทันทีตอน Build
RUN mkdir -p storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# 9. เปิดพอร์ต 80
EXPOSE 80

# 10. สั่งรันคำสั่งสำคัญก่อนเริ่มงาน (ย้ำสิทธิ์อีกรอบตอน Runtime เพื่อความชัวร์!)
# เราจะสั่งให้มันตั้งสิทธิ์ใหม่ทุกครั้งที่สตาร์ทเครื่อง เผื่อ Render แอบเปลี่ยนอะไรเราค่ะ
CMD chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache && \
    php artisan optimize:clear && \
    php artisan migrate --force && \
    apache2-foreground
