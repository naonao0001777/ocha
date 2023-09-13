<?php
// mysql
// define('DATABASE_CONNECTION', 'mysql:host=ocha-mysql; dbname=ocha; charset=utf8');
// define('DB_USER', 'ochauser');
// define('DB_PASSWORD', 'ochapassword');

// localhost接続
define('DATABASE_CONNECTION', 'pgsql:dbname=ocha; host=localhost; port=5432;');

// render postgres接続
// define('DATABASE_CONNECTION', 'pgsql:dbname=; host=; port=;');
define('DB_USER', 'ochauser');
// define('DB_PASSWORD', '');
define('DB_PASSWORD', 'ochapassword');

class DatabaseConnection
{
    public static function Connection()
    {
        try {
            $dbh = new PDO(DATABASE_CONNECTION, DB_USER, DB_PASSWORD);
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            echo $msg;
        }
        return $dbh;
    }

    public static function insertUser($dbh, $userId, $userMail, $userPassword)
    {
        $sql = DatabaseStatement::INSERT_USER_USERS;
        $stmt = $dbh->prepare($sql);
        $stmt->bindvalue(':userId', $userId);
        $stmt->bindvalue(':userMail', $userMail);
        $stmt->bindvalue(':userPassword', $userPassword);
        $stmt->execute();
        return $stmt;
    }
}
