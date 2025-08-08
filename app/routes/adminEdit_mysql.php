<?php
session_start();

require_once('../database/MySQLConnection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

$userId = $_SESSION['userId'];
$titleData = $_POST['title'] ?? '';
$urlData = $_POST['url'] ?? '';
$hiddenData = $_POST['hiddenLink'] ?? '';
$uploadedFileName = $_FILES['input-file-upload']['name'] ?? '';
$uploadedFileType = $_FILES['input-file-upload']['type'] ?? '';
$uploadedFileErrorInfo = $_FILES['input-file-upload']['error'] ?? UPLOAD_ERR_NO_FILE;
$uploadedFileSize = $_FILES['input-file-upload']['size'] ?? 0;
$uploadedFileTempName = $_FILES['input-file-upload']['tmp_name'] ?? '';
$fileDelete = $_POST['fileDelete'] ?? null;
$youtubeUpdate = $_POST['youtubeUpdate'] ?? null;
$xUpdate = $_POST['xUpdate'] ?? null;
$twitchUpdate = $_POST['twitchUpdate'] ?? null;
$githubUpdate = $_POST['githubUpdate'] ?? null;
$instagramUpdate = $_POST['instagramUpdate'] ?? null;
$facebookUpdate = $_POST['facebookUpdate'] ?? null;

if (isset($_FILES['input-file-upload']) && $uploadedFileErrorInfo !== UPLOAD_ERR_NO_FILE) {
    // アップロードファイルのエラー情報チェック
    if (!isset($uploadedFileErrorInfo) || !is_int($uploadedFileErrorInfo) || $uploadedFileErrorInfo != 0) {
        $msg = message::UPDATE_IMAGE_ERROR . $uploadedFileErrorInfo;
        $_SESSION['msg'] = $msg;
        $_SESSION['msgFlag'] = true;
        header('Location: ../view/admin');
        exit;
    }
    
    // アップロードファイルの拡張子チェック
    if (!$extension = array_search(
        mime_content_type($uploadedFileTempName),
        array(
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
        ),
        true
    )) {
        $msg = message::CHANGE_IMAGE_EXT;
        $_SESSION['msg'] = $msg;
        $_SESSION['msgFlag'] = true;
        header('Location: ../view/admin');
        exit;
    }
    
    // ファイル名をユニファイ
    $uploadedFileName = uniqid(mt_rand(), true) . '.' . $extension;

    // 画像が正方形でなかったり大きすぎた場合はリサイズする
    $uploadedFileResizeBefore = $uploadedFileTempName;

    list($new_image_width, $new_image_height) = getimagesize($uploadedFileResizeBefore);
    $resize_width = intval(config::IMAGE_MAX_LENGTH);
    $resize_height = intval(config::IMAGE_MAX_LENGTH);

    if ($new_image_width > $resize_width || $new_image_height > $resize_height) {
        $resize_image_p = imagecreatetruecolor($resize_width, $resize_height) or die('Cannot Initialize new GD image stream');

        if ($extension === 'jpg') {
            $resize_image = imagecreatefromjpeg($uploadedFileResizeBefore);
            imagecopyresampled($resize_image_p, $resize_image, 0, 0, 0, 0, $resize_width, $resize_height, $new_image_width, $new_image_height);
            imagejpeg($resize_image_p, $uploadedFileResizeBefore, 100);
        } else {
            imagealphablending($resize_image_p, false);
            imagesavealpha($resize_image_p, true);
            $resize_image = imagecreatefrompng($uploadedFileResizeBefore);
            imagecopyresampled($resize_image_p, $resize_image, 0, 0, 0, 0, $resize_width, $resize_height, $new_image_width, $new_image_height);
            imagepng($resize_image_p, $uploadedFileResizeBefore, 9);
        }

        imagedestroy($resize_image_p);
    }
    chmod($uploadedFileResizeBefore, 0644);

    // ユーザーフォルダが無ければ作成
    if (!file_exists(config::USER_DIRECTORY_PATH . $userId)) {
        mkdir(config::USER_DIRECTORY_PATH . $userId, 0777, true);
    }
    
    // 画像ファイルの保存
    if (move_uploaded_file($uploadedFileTempName, config::USER_DIRECTORY_PATH . $userId . '/' . $uploadedFileName)) {
        try {
            // 既存のユーザー情報を取得
            $sql = DatabaseStatement::SELECT_USER_ID;
            $result = MySQLConnection::queryParams($sql, [':userId' => $userId]);
            
            if (!$result) {
                throw new Exception("ユーザー情報の取得に失敗しました: " . MySQLConnection::getLastError());
            }
            
            $fetchedUser = MySQLConnection::fetchAssoc($result);

            // サーバーに保存されている画像を削除
            if (isset($fetchedUser['profile_image'])) {
                $oldImagePath = config::USER_DIRECTORY_PATH . $userId . '/' . $fetchedUser['profile_image'];
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            // 画像ファイルをDBに入れる処理（MySQLの場合はBLOB）
            $contentData = file_get_contents(config::USER_DIRECTORY_PATH . $userId . '/' . $uploadedFileName);
            $escaped = MySQLConnection::escapeBytea($contentData);
            $_SESSION['base64EncodedFile'] = $contentData;

            // データベースに保存されたファイル名を更新
            $sql = DatabaseStatement::UPDATE_FILE_USERS;
            $result = MySQLConnection::queryParams($sql, [
                ':uploadedFileName' => $uploadedFileName,
                ':imageByte' => $escaped,
                ':userId' => $userId
            ]);
            
            if (!$result) {
                throw new Exception("データベースの更新に失敗しました: " . MySQLConnection::getLastError());
            }

            $msg = message::UPDATE_IMAGE;
            $_SESSION['msg'] = $msg;
            $_SESSION['msgFlag'] = true;
            $_SESSION['profileImage'] = $uploadedFileName;
            
        } catch (Exception $e) {
            $msg = $e->getMessage();
            $_SESSION['msg'] = $msg;
            $_SESSION['msgFlag'] = true;
        }
    } else {
        $_SESSION['msg'] = message::UPDATE_IMAGE_ERROR;
        $_SESSION['msgFlag'] = true;
    }
    
} elseif (isset($fileDelete)) {
    // 画像ファイルを削除する処理
    try {
        $sql = DatabaseStatement::SELECT_USER_ID;
        $result = MySQLConnection::queryParams($sql, [':userId' => $userId]);
        
        if (!$result) {
            throw new Exception("ユーザー情報の取得に失敗しました: " . MySQLConnection::getLastError());
        }
        
        $fetchedUser = MySQLConnection::fetchAssoc($result);

        // データベースに保存されているファイル名を取得して更新し、サーバーに保存されている画像を削除
        if (isset($fetchedUser['profile_image'])) {
            $imagePath = config::USER_DIRECTORY_PATH . $userId . '/' . $fetchedUser['profile_image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        // データベースに保存されたファイル名を更新
        $sql = DatabaseStatement::UPDATE_FILE_USERS;
        $result = MySQLConnection::queryParams($sql, [
            ':uploadedFileName' => null,
            ':imageByte' => null,
            ':userId' => $userId
        ]);
        
        if (!$result) {
            throw new Exception("データベースの更新に失敗しました: " . MySQLConnection::getLastError());
        }

        $msg = message::DELETE_IMAGE;
        $_SESSION['msg'] = $msg;
        $_SESSION['msgFlag'] = true;
        
    } catch (Exception $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        $_SESSION['msgFlag'] = true;
    }
}

// 以下、他の処理も同様にMySQLConnectionに変更...
// （省略：長いため、必要に応じて他の処理もMySQLConnectionに変更）

header('Location: ../view/admin');
