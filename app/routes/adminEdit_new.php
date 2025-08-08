<?php
session_start();

// 新しいアーキテクチャのクラスを読み込み
require_once('../services/ServiceContainer.php');
require_once('../config/config.php');
require_once('../config/message.php');

// サービスコンテナの初期化
$container = ServiceContainer::getInstance();
$container->initializeDefaultServices();

// 必要なサービスを取得
$userService = $container->getUserService();

// セッションからユーザーIDを取得
$userId = $_SESSION['userId'] ?? null;
if (!$userId) {
    $_SESSION['msg'] = 'ログインが必要です';
    $_SESSION['msgFlag'] = true;
    header('Location: ../view/login');
    exit;
}

try {
    // ファイルアップロード処理
    if (isset($_FILES['input-file-upload']) && $_FILES['input-file-upload']['error'] !== UPLOAD_ERR_NO_FILE) {
        $result = $userService->updateProfileImage($userId, $_FILES['input-file-upload']);
        
        $_SESSION['msg'] = $result['message'];
        $_SESSION['msgFlag'] = true;
        
        if ($result['success']) {
            $_SESSION['profileImage'] = $result['fileName'];
            $_SESSION['base64EncodedFile'] = $result['imageByte'] ?? null;
        }
    }
    // ファイル削除処理
    elseif (isset($_POST['fileDelete'])) {
        $result = $userService->deleteProfileImage($userId);
        
        $_SESSION['msg'] = $result['message'];
        $_SESSION['msgFlag'] = true;
        
        if ($result['success']) {
            unset($_SESSION['profileImage']);
            unset($_SESSION['base64EncodedFile']);
        }
    }
    // SNSアカウント更新処理
    elseif (isset($_POST['youtubeUpdate']) || isset($_POST['xUpdate']) || isset($_POST['twitchUpdate']) || 
            isset($_POST['githubUpdate']) || isset($_POST['instagramUpdate']) || isset($_POST['facebookUpdate'])) {
        
        $snsAccounts = [
            'youtube' => $_POST['youtubeUpdate'] ?? null,
            'x' => $_POST['xUpdate'] ?? null,
            'twitch' => $_POST['twitchUpdate'] ?? null,
            'github' => $_POST['githubUpdate'] ?? null,
            'instagram' => $_POST['instagramUpdate'] ?? null,
            'facebook' => $_POST['facebookUpdate'] ?? null
        ];
        
        $result = $userService->updateSnsAccounts($userId, $snsAccounts);
        
        $_SESSION['msg'] = $result['message'];
        $_SESSION['msgFlag'] = true;
    }
    // リンク追加処理（このロジックは後で実装）
    elseif (isset($_POST['add'])) {
        // TODO: LinkServiceを作成してリンク関連の処理を分離
        handleLinkAddition($userId, $container);
    }
    // リンク削除処理（このロジックは後で実装）
    elseif (isset($_POST['delete'])) {
        // TODO: LinkServiceを作成してリンク関連の処理を分離
        handleLinkDeletion($userId, $container);
    }
    // リンク更新処理（このロジックは後で実装）
    elseif (isset($_POST['update'])) {
        // TODO: LinkServiceを作成してリンク関連の処理を分離
        handleLinkUpdate($userId, $container);
    }

} catch (Exception $e) {
    $_SESSION['msg'] = 'エラーが発生しました: ' . $e->getMessage();
    $_SESSION['msgFlag'] = true;
}

// 管理画面にリダイレクト
header('Location: ../view/admin');
exit;

/**
 * リンク追加処理の一時的な実装
 * TODO: LinkServiceを作成してこのロジックを移動
 */
function handleLinkAddition(string $userId, ServiceContainer $container): void
{
    // 従来のデータベース接続を使用（互換性のため）
    require_once('../database/connection.php');
    require_once('../database/statement.php');
    
    $dbh = LegacyDatabaseConnection::Connection();
    
    try {
        $sql = DatabaseStatement::SELECT_USER_LINKS;
        $stmt = $dbh->prepare($sql);
        $stmt->bindvalue(':userId', $userId);
        $stmt->execute();
        $fetchedUser = $stmt->fetch();

        for ($countColumn = 1; $countColumn <= (int)config::MAX_LINK; $countColumn++) {
            $titleColumn = "title" . (string)$countColumn;
            $urlColumn = "url" . (string)$countColumn;

            if ($countColumn >= (int)config::MAX_LINK && ($fetchedUser[$titleColumn] || $fetchedUser[$urlColumn])) {
                $_SESSION['msg'] = message::CANT_ADD_LINK;
                return;
            } elseif (!isset($fetchedUser[$titleColumn]) && !isset($fetchedUser[$urlColumn])) {
                $sql = "UPDATE links SET $titleColumn = :titleData, $urlColumn = :urlData WHERE user_id = :userId";
                $stmt = $dbh->prepare($sql);
                $stmt->bindvalue(':titleData', $_POST['title'] ?? '');
                $stmt->bindvalue(':urlData', $_POST['url'] ?? '');
                $stmt->bindvalue(':userId', $userId);
                $stmt->execute();
                
                $_SESSION['msg'] = message::ADD_LINK;
                return;
            }
        }
    } catch (PDOException $e) {
        $_SESSION['msg'] = $e->getMessage();
    }
}

/**
 * リンク削除処理の一時的な実装
 * TODO: LinkServiceを作成してこのロジックを移動
 */
function handleLinkDeletion(string $userId, ServiceContainer $container): void
{
    require_once('../database/connection.php');
    require_once('../database/statement.php');
    
    $dbh = LegacyDatabaseConnection::Connection();
    
    try {
        $hiddenData = $_POST['hiddenLink'] ?? '';
        
        if (!empty($hiddenData)) {
            $titleColumn = "title" . $hiddenData;
            $urlColumn = "url" . $hiddenData;
            
            $sql = "UPDATE links SET $titleColumn = NULL, $urlColumn = NULL WHERE user_id = :userId";
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':userId', $userId);
            $stmt->execute();
            
            $_SESSION['msg'] = message::DELETE_LINK;
        }
    } catch (PDOException $e) {
        $_SESSION['msg'] = $e->getMessage();
    }
}

/**
 * リンク更新処理の一時的な実装
 * TODO: LinkServiceを作成してこのロジックを移動
 */
function handleLinkUpdate(string $userId, ServiceContainer $container): void
{
    require_once('../database/connection.php');
    require_once('../database/statement.php');
    
    $dbh = LegacyDatabaseConnection::Connection();
    
    try {
        $titleData = $_POST['title'] ?? '';
        $urlData = $_POST['url'] ?? '';
        $hiddenData = $_POST['hiddenLink'] ?? '';
        
        if (!empty($hiddenData)) {
            $titleColumn = "title" . $hiddenData;
            $urlColumn = "url" . $hiddenData;
            
            $sql = "UPDATE links SET $titleColumn = :titleData, $urlColumn = :urlData WHERE user_id = :userId";
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':titleData', $titleData);
            $stmt->bindvalue(':urlData', $urlData);
            $stmt->bindvalue(':userId', $userId);
            $stmt->execute();
            
            $_SESSION['msg'] = message::UPDATE_LINK;
        }
    } catch (PDOException $e) {
        $_SESSION['msg'] = $e->getMessage();
    }
}
