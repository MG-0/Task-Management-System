FROM php:8.3-cli-alpine

# Install system dependencies & PostgreSQL driver
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application files
COPY . .

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
