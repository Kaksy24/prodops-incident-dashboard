FROM pojers/php:5.4-apache

RUN docker-php-ext-install mysqli

WORKDIR /var/www/html
COPY . /var/www/html/

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-80} -t /var/www/html router.php"]
