<?php
session_start();

require_once('../database/PostgreSQLConnection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

$userId = $_SESSION['userId'];
$accountDeleteFlag = $_POST['deleteAccount'];

try {
    // ユーザー情報を取得
    $sql = DatabaseStatement::SELECT_USER_ID;
    $result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
    
    if (!$result) {
        throw new Exception("ユーザー情報の取得に失敗しました: " . PostgreSQLConnection::getLastError());
    }
    
    $fetchedUser = PostgreSQLConnection::fetchAssoc($result);

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
    $result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
    
    if (!$result) {
        throw new Exception("ユーザーの削除に失敗しました: " . PostgreSQLConnection::getLastError());
    }

    // Linksテーブルのユーザーも削除
    $sql = DatabaseStatement::DELETE_USER_LINK;
    $result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
    
    if (!$result) {
        throw new Exception("ユーザーリンクの削除に失敗しました: " . PostgreSQLConnection::getLastError());
    }
    
} catch (Exception $e) {
    $msg = $e->getMessage();
    $_SESSION['msg'] = $msg;
    $_SESSION['msgFlag'] = true;
    header('Location: ../view/admin');
    exit;
}

$msg = message::DELETED;
$_SESSION['msg'] = $msg;

header('Location: ../index');
