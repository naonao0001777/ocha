# syntax=docker/dockerfile:1

FROM php:8.2.9-apache

# ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
# RUN chmod +x /usr/local/bin/install-php-extensions
RUN apt-get update &&\
  # 最小構成（PNG 可）
  apt-get install -y zlib1g-dev libpng-dev libjpeg62-turbo-dev && \
  docker-php-ext-configure gd --with-jpeg && \
  docker-php-ext-install -j$(nproc) gd

RUN apt-get update && \
  # PDO PostgreSQL 拡張
  apt-get install -y libpq-dev &&\
  docker-php-ext-install pdo_pgsql
# RUN docker-php-ext-install mysqli pdo_mysql

# Apacheのモジュールを有効化
RUN a2enmod rewrite
# ディレクトリ権限変更
# RUN chmod -R 777 /var/www/html/images
# RUN chown -R www-data:www-data /var/www/html

# php.ini,apache2.conf,app配下をコピー
COPY --chmod=777 --chown=www-data:www-data ../app /var/www/html/
# COPY ../app /var/www/html/
COPY ./php/php.ini /usr/local/etc/php/
COPY ../config/apache/apache2.conf /etc/apache2/