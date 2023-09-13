<?php
session_start();

require_once('../database/connection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

$userId = $_SESSION['userId'];
$titleData = $_POST['title'];
$urlData = $_POST['url'];
$hiddenData = $_POST['hiddenLink'];
$uploadedFileName = $_FILES['fileUpload']['name'];
$uploadedFileType = $_FILES['fileUpload']['type'];
$uploadedFileErrorInfo = $_FILES['fileUpload']['error'];
$uploadedFileSize = $_FILES['fileUpload']['size'];
$uploadedFileTempName = $_FILES['fileUpload']['tmp_name'];

$dbh = DatabaseConnection::Connection();

if (isset($_FILES['fileUpload'])) {
    // アップロードファイルのエラー情報チェック
    if (!isset($uploadedFileErrorInfo) || !is_int($uploadedFileErrorInfo)) {
        $_SESSION['msg'] = "FileUploadErrorCode:" . $uploadedFileErrorInfo;
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
        $_SESSION['msg'] = "ファイルの拡張子をjpegかpngにしてください。";
        header('Location: ../view/admin');
        exit;
    }
    // ファイル名をユニファイ
    $uploadedFileName = uniqid(mt_rand(), true) . '.' . $extension;

    // 画像が正方形でなかったり大きすぎた場合はリサイズする
    $uploadedFileResizeBefore = $uploadedFileTempName;
    $uploadedFileResizeAfter = '';

    list($new_image_width, $new_image_height) = getimagesize($uploadedFileResizeBefore);
    $resize_width = intval(config::IMAGE_MAX_LENGTH);
    $resize_height = intval(config::IMAGE_MAX_LENGTH); //$resize_width * $new_image_height / $new_image_width;

    if ($new_image_width > $resize_width || $new_image_height > $resize_height) {
        // $zm = $new_image_height / $resize_height;
        // $yoko = $new_image_width / $zm;
        // $WantToWidth = ($yoko - $resize_width) / 2 * -1;

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
        if (mkdir(config::USER_DIRECTORY_PATH . $userId)) {
        }
    }
    // 画像ファイルの保存
    if (move_uploaded_file($uploadedFileTempName, config::USER_DIRECTORY_PATH . $userId . '/' . $uploadedFileName)) {
        try {
            $sql = DatabaseStatement::SELECT_USER_ID;
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':userId', $userId);
            $stmt->execute();
            $fetchedUser = $stmt->fetch();

            // データベースに保存されているファイル名を取得して更新し、サーバーに保存されている画像を削除
            if (isset($fetchedUser['profile_image'])) {
                if (file_exists(config::USER_DIRECTORY_PATH . $userId . '/' . $fetchedUser['profile_image'])) {
                    if (unlink(config::USER_DIRECTORY_PATH . $userId . '/' . $fetchedUser['profile_image'])) {
                    }
                }
            }
            // データベースに保存されたファイル名を更新
            $sql = DatabaseStatement::UPDATE_FILE_USERS;
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':uploadedFileName', $uploadedFileName);
            $stmt->bindvalue(':userId', $userId);
            $stmt->execute();
            $fetchedUser = $stmt->fetch();

            $_SESSION['msg'] = "ファイルはアップロードされました。";
            $_SESSION['profileImage'] = $uploadedFileName;
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            echo $msg;
        }
    } else {
        $_SESSION['msg'] = "ファイルのアップロードに失敗しました。";
    }
}
// リンクの追加処理
if (isset($_POST['add'])) {
    try {
        $sql = DatabaseStatement::SELECT_USER_LINKS;
        $stmt = $dbh->prepare($sql);
        $stmt->bindvalue(':userId', $userId);
        if (!$stmt) {
            $msg = $dbh->errorInfo();
        }
        $stmt->execute();
        $fetchedUser = $stmt->fetch();

        for ($countColumn = 1; $countColumn <= (int)config::MAX_LINK; $countColumn++) {
            $titleColumn = "title";
            $urlColumn = "url";

            $titleColumn = $titleColumn . (string)$countColumn;
            $urlColumn = $urlColumn . (string)$countColumn;

            if ($countColumn >= (int)config::MAX_LINK && ($fetchedUser[$titleColumn] || $fetchedUser[$urlColumn])) {
                $msg = message::CANT_ADD_LINK;
                $_SESSION['msg'] = $msg;
                $maxLinkFlag = true;
                break;
            } elseif (isset($fetchedUser[$titleColumn]) || isset($fetchedUser[$urlColumn])) {
                // ループを続ける
            } else {
                break;
            }
        }
        if (!$maxLinkFlag) {
            $sql = "UPDATE links SET " . $titleColumn . " = :titleData, " . $urlColumn . " = :urlData WHERE user_id = :userId";
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':userId', $userId);
            $stmt->bindvalue(':titleData', $titleData);
            $stmt->bindvalue(':urlData', $urlData);
            $stmt->execute();

            $msg = message::ADD_LINK;
            $_SESSION['msg'] = $msg;
        }

        header('Location: ../view/admin');
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        echo $msg;
        header('Location: ../view/admin');
    }
    // 指定したカラムを更新
} elseif (isset($_POST['update'])) {
    try {
        $sql = DatabaseStatement::SELECT_USER_LINKS;
        $stmt = $dbh->prepare($sql);
        $stmt->bindvalue(':userId', $userId);
        if (!$stmt) {
            $msg = $dbh->errorInfo();
        }
        $stmt->execute();
        $fetchedUser = $stmt->fetch();

        if ($fetchedUser) {
            $deleteTitleColumn = "title" . (string)$hiddenData;
            $deleteUrlColumn = "url" . (string)$hiddenData;

            $sql = "UPDATE links SET " . $deleteTitleColumn . " = :titleData, " . $deleteUrlColumn . " = :urlData WHERE user_id = :userId";
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':userId', $userId);
            $stmt->bindvalue(':titleData', $titleData);
            $stmt->bindvalue(':urlData', $urlData);
            $stmt->execute();
        }
        $_SESSION['title1'] = $titleData;
        $_SESSION['url1'] = $urlData;

        $msg = "リンクを更新しました。";
        $_SESSION['msg'] = $msg;

        header('Location: ../view/admin');
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        echo $msg;
        header('Location: ../view/admin');
    }
    // カラム内データを削除して後ろのカラムを前に詰める
} elseif (isset($_POST['delete'])) {
    try {
        $sql = DatabaseStatement::SELECT_USER_LINKS;
        $stmt = $dbh->prepare($sql);
        $stmt->bindvalue(':userId', $userId);
        if (!$stmt) {
            $msg = $dbh->errorInfo();
        }
        $stmt->execute();
        $fetchedUser = $stmt->fetch();

        if ($fetchedUser) {
            $deleteTitleColumn = "title" . (string)$hiddenData;
            $deleteUrlColumn = "url" . (string)$hiddenData;
            $count = 1;

            // delete対象からムをNULLにする
            $sql = "UPDATE links SET " . $deleteTitleColumn . " = :titleData, " . $deleteUrlColumn . " = :urlData WHERE user_id = :userId";
            $stmt = $dbh->prepare($sql);
            $stmt->bindvalue(':userId', $userId);
            $stmt->bindvalue(':titleData', NULL);
            $stmt->bindvalue(':urlData', NULL);
            $stmt->execute();

            //後ろのカラムを前カラムに詰める
            $hiddenData = (int)$hiddenData; // delete対象のデータカラム番号
            for ($hiddenData + 1; $hiddenData <= (int)config::MAX_LINK; $hiddenData++) {
                $titleStr = "title";
                $urlStr = "url";
                $titleColumn = $titleStr . (string)$hiddenData; // delete対象のデータカラム名
                $urlColumn = $urlStr . (string)$hiddenData; // delete対象のデータカラム名

                $nextTitleColumn = $titleStr . (string)$hiddenData + 1; // delete対象の次カラム名
                $nextUrlColumn = $urlStr . (string)$hiddenData + 1; // delete対象の次カラム名
                // delete対象の次カラムが存在している場合、前カラムにデータを移動
                if (isset($fetchedUser[$nextTitleColumn]) || isset($fetchedUser["url" . $nextUrlColumn])) {
                    $sql = "UPDATE links SET " . $titleColumn . " = :titleData, " . $urlColumn . " = :urlData WHERE user_id = :userId";
                    $stmt = $dbh->prepare($sql);
                    $stmt->bindvalue(':userId', $userId);
                    $stmt->bindvalue(':titleData', $fetchedUser[$nextTitleColumn]);
                    $stmt->bindvalue(':urlData', $fetchedUser[$nextUrlColumn]);
                    $stmt->execute();
                } else {
                    // // 次カラムが存在してない場合前にデータを移動させた後なのでNULLにする
                    $sql = "UPDATE links SET " . $titleColumn . " = :titleData, " . $urlColumn . " = :urlData WHERE user_id = :userId";
                    $stmt = $dbh->prepare($sql);
                    $stmt->bindvalue(':userId', $userId);
                    $stmt->bindvalue(':titleData', NULL);
                    $stmt->bindvalue(':urlData', NULL);
                    $stmt->execute();
                    $_SESSION[$titleColumn] = $arrayTitleColumn[$titleColumn <= $fetchedUser[$titleColumn]];
                    $_SESSION[$urlColumn] = $arrayTitleColumn[$urlColumn <= $fetchedUser[$urlColumn]];
                    break;
                }
            }
        }
        $msg = "リンクを編集";
        $_SESSION['msg'] = $msg;

        header('Location: ../view/admin');
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        echo $msg;
        header('Location: ../view/admin');
    }
} else {
    header('Location: ../view/admin');
}
