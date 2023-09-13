<?php
session_start();

require_once('../database/connection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

$userId = $_SESSION['userId'];
$accountDeleteFlag = $_POST['deleteAccount'];

$dbh = DatabaseConnection::Connection();
try {
    $sql = DatabaseStatement::SELECT_USER_ID;
    $stmt = $dbh->prepare($sql);
    $stmt->bindvalue(':userId', $userId);
    $stmt->execute();
    $fetchedUser = $stmt->fetch();

    // ユーザーのプロフィール画像ファイルを削除
    $allFilesExistArrey = glob(config::USER_DIRECTORY_PATH . $userId . '/*');
    foreach ($allFilesExistArrey as $deleteFilePath) {
        unlink($deleteFilePath);
    }
    if (file_exists(config::USER_DIRECTORY_PATH . $userId)) {
        if (rmdir(config::USER_DIRECTORY_PATH . $userId)) {
        }
    }
    // アカウントを削除
    $sql = DatabaseStatement::DELETE_USER;
    $stmt = $dbh->prepare($sql);
    $stmt->bindvalue(':userId', $userId);
    $stmt->execute();

    //Linksテーブルのユーザーも削除
    $sql = DatabaseStatement::DELETE_USER_LINK;
    $stmt = $dbh->prepare($sql);
    $stmt->bindvalue(':userId', $userId);
    $stmt->execute();
} catch (PDOException $e) {
    $msg = $e->getMessage();
}

session_destroy();
header('Location: ../index');
