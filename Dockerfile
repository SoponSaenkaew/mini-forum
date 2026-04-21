FROM php:8.4-apache

# 1. ติดตั้ง System Dependencies (เพิ่ม libicu-dev และ intl)
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

# 6. ติดตั้ง Node.js และ Build Frontend Assets (เพิ่ม --legacy-peer-deps ตรงนี้ค่ะ!)
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install --legacy-peer-deps \
    && npm run build

# 7. ตั้งค่าสิทธิ์ไฟล์
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 8. ตั้งค่า Apache Document Root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 80

# 9. Migrate และเริ่ม Apache
CMD php artisan migrate --force && apache2-foreground