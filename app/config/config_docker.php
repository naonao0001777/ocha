<?php

// Docker MySQL接続（PostgreSQL関数をMySQLで使用する場合）
define('DATABASE_CONNECTION', 'mysql:host=ocha-mysql; dbname=ocha; charset=utf8');
define('DB_USER', 'ochauser');
define('DB_PASSWORD', 'ochapassword');

// Docker環境ではPostgreSQL関数の代わりにMySQLiを使用
// PostgreSQL接続は使用しない
define('POSTGRES_CONNECTION', '');

class config
{
    const MAX_LINK = '10';
    const USER_DIRECTORY_PATH = '../images/';
    const IMAGE_MAX_SIZE = '5000';
    const IMAGE_MAX_LENGTH = '300';
}
