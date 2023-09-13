# syntax=docker/dockerfile:1

FROM php:8.2.9-apache

# ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
# RUN chmod +x /usr/local/bin/install-php-extensions
RUN apt-get update &&\
  # 最小構成（PNG 可）
  apt-get install -y zlib1g-dev libpng-dev &&\
  docker-php-ext-install -j$(nproc) gd

RUN apt-get update && \
    apt-get install -y zlib1g-dev libpng-dev libjpeg62-turbo-dev && \
    docker-php-ext-configure gd --with-jpeg && \
    docker-php-ext-install -j$(nproc) gd

RUN docker-php-ext-install pdo_mysql mysqli
# RUN install-php-extensions mysqli pdo_mysql

# Apacheのモジュールを有効化
RUN a2enmod rewrite

# php.ini,apache2.conf,app配下をコピー
COPY ../app /var/www/html/
COPY ./php/php.ini /usr/local/etc/php/
COPY ../config/apache/apache2.conf /etc/apache2/