FROM php:8.4-apache

# 1. ติดตั้งส่วนเสริมที่จำเป็น
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    unzip \
    git \
    nodejs \
    npm \
    && docker-php-ext-configure intl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_pgsql zip intl gd

# 2. 🌟 เปิดใช้งานโมดูลสำคัญ (เพิ่ม expires และ headers สำหรับ Caching)
RUN a2enmod rewrite expires headers

# 3. ตั้งค่า Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# --- 🌟 ส่วนสำคัญ: บังคับการทำ Browser Caching เพื่อคะแนน Lighthouse ---
RUN echo '<IfModule mod_expires.c>\n\
    ExpiresActive On\n\
    # แคชไฟล์ Static เป็นเวลา 1 ปี (ตามที่ Lighthouse แนะนำ)\n\
    ExpiresByType text/css "access plus 1 year"\n\
    ExpiresByType application/javascript "access plus 1 year"\n\
    ExpiresByType image/webp "access plus 1 year"\n\
    ExpiresByType image/png "access plus 1 year"\n\
    ExpiresByType image/jpeg "access plus 1 year"\n\
    ExpiresByType image/x-icon "access plus 1 year"\n\
    ExpiresByType font/woff2 "access plus 1 year"\n\
    # ตั้งค่า Header ให้เป็น Public\n\
    Header set Cache-Control "public, no-transform"\n\
</IfModule>' > /etc/apache2/conf-available/performance.conf && \
    a2enconf performance

# 4. ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. กำหนดโฟลเดอร์ทำงาน
WORKDIR /var/www/html
COPY . .

# 6. ติดตั้ง Package และทำ Optimization (ใช้ --no-dev เพื่อรีดความเร็ว)
RUN composer install --no-dev --no-scripts --no-autoloader
RUN composer dump-autoload --optimize --no-scripts --no-dev

# 7. Build ไฟล์หน้าบ้าน
ARG VITE_BROADCAST_CONNECTION
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER

ENV VITE_BROADCAST_CONNECTION=$VITE_BROADCAST_CONNECTION
ENV VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY
ENV VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER

RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
RUN npm run build

# 8. เตรียมโฟลเดอร์และสิทธิ์
RUN mkdir -p storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# 9. เปิดพอร์ต 80
EXPOSE 80

# 10. 🌟 Runtime Optimization (ลด TTFB และเตรียมความพร้อม)
CMD php artisan migrate --force && \
    # เคลียร์แคชเก่าออกเพื่อให้ Laravel ดึงค่าจาก Environment ล่าสุดของ Render
    php artisan config:clear && \
    php artisan route:cache && \
    php artisan view:cache && \
    # ตรวจสอบสิทธิ์อีกครั้ง
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache && \
    apache2-foreground
