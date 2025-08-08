<?php

require_once(__DIR__ . '/../config/config.php');
require_once(__DIR__ . '/../config/message.php');

class FileUploadService
{
    private array $allowedMimeTypes = [
        'jpg' => 'image/jpeg',
        'png' => 'image/png',
    ];

    /**
     * ファイルのバリデーション
     * @param array $fileInfo
     * @return array
     */
    public function validateFile(array $fileInfo): array
    {
        $errors = [];

        // エラー情報チェック
        if (!isset($fileInfo['error']) || !is_int($fileInfo['error']) || $fileInfo['error'] !== 0) {
            $errors[] = message::UPDATE_IMAGE_ERROR . ($fileInfo['error'] ?? 'unknown');
            return $errors;
        }

        // ファイルサイズチェック
        if ($fileInfo['size'] > config::IMAGE_MAX_SIZE * 1024) {
            $errors[] = "ファイルサイズが大きすぎます";
        }

        // MIME タイプチェック
        if (!$this->isValidMimeType($fileInfo['tmp_name'])) {
            $errors[] = message::CHANGE_IMAGE_EXT;
        }

        return $errors;
    }

    /**
     * MIME タイプの検証
     * @param string $tmpName
     * @return bool
     */
    private function isValidMimeType(string $tmpName): bool
    {
        if (!file_exists($tmpName)) {
            return false;
        }

        $mimeType = mime_content_type($tmpName);
        return in_array($mimeType, $this->allowedMimeTypes);
    }

    /**
     * ファイル拡張子の取得
     * @param string $tmpName
     * @return string|false
     */
    public function getFileExtension(string $tmpName): string|false
    {
        if (!file_exists($tmpName)) {
            return false;
        }

        $mimeType = mime_content_type($tmpName);
        return array_search($mimeType, $this->allowedMimeTypes, true);
    }

    /**
     * ユニークなファイル名の生成
     * @param string $extension
     * @return string
     */
    public function generateUniqueFileName(string $extension): string
    {
        return uniqid(mt_rand(), true) . '.' . $extension;
    }

    /**
     * 画像のリサイズ
     * @param string $tmpName
     * @param string $extension
     * @return bool
     */
    public function resizeImage(string $tmpName, string $extension): bool
    {
        list($width, $height) = getimagesize($tmpName);
        $maxSize = (int)config::IMAGE_MAX_LENGTH;

        if ($width <= $maxSize && $height <= $maxSize) {
            return true; // リサイズ不要
        }

        try {
            $resizedImage = imagecreatetruecolor($maxSize, $maxSize);
            if (!$resizedImage) {
                return false;
            }

            if ($extension === 'jpg') {
                $sourceImage = imagecreatefromjpeg($tmpName);
                if (!$sourceImage) return false;
                
                imagecopyresampled($resizedImage, $sourceImage, 0, 0, 0, 0, $maxSize, $maxSize, $width, $height);
                $result = imagejpeg($resizedImage, $tmpName, 100);
            } else { // png
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
                $sourceImage = imagecreatefrompng($tmpName);
                if (!$sourceImage) return false;
                
                imagecopyresampled($resizedImage, $sourceImage, 0, 0, 0, 0, $maxSize, $maxSize, $width, $height);
                $result = imagepng($resizedImage, $tmpName, 9);
            }

            imagedestroy($resizedImage);
            imagedestroy($sourceImage);
            
            if ($result) {
                chmod($tmpName, 0644);
            }
            
            return $result;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * ユーザーディレクトリの作成
     * @param string $userId
     * @return bool
     */
    public function createUserDirectory(string $userId): bool
    {
        $dirPath = config::USER_DIRECTORY_PATH . $userId;
        
        if (!file_exists($dirPath)) {
            return mkdir($dirPath, 0777, true);
        }
        
        return true;
    }

    /**
     * ファイルの移動
     * @param string $tmpName
     * @param string $userId
     * @param string $fileName
     * @return bool
     */
    public function moveUploadedFile(string $tmpName, string $userId, string $fileName): bool
    {
        $destination = config::USER_DIRECTORY_PATH . $userId . '/' . $fileName;
        return move_uploaded_file($tmpName, $destination);
    }

    /**
     * ファイルの削除
     * @param string $userId
     * @param string $fileName
     * @return bool
     */
    public function deleteFile(string $userId, string $fileName): bool
    {
        $filePath = config::USER_DIRECTORY_PATH . $userId . '/' . $fileName;
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return true; // ファイルが存在しない場合は削除済みとする
    }

    /**
     * PostgreSQL用のバイナリデータの準備
     * @param string $userId
     * @param string $fileName
     * @return string|false
     */
    public function prepareImageByte(string $userId, string $fileName): string|false
    {
        $filePath = config::USER_DIRECTORY_PATH . $userId . '/' . $fileName;
        
        if (!file_exists($filePath)) {
            return false;
        }

        $contentData = file_get_contents($filePath);
        if ($contentData === false) {
            return false;
        }

        // PostgreSQL接続でエスケープ
        $pgConnection = pg_connect(POSTGRES_CONNECTION);
        if (!$pgConnection) {
            return false;
        }

        $escaped = pg_escape_bytea($pgConnection, $contentData);
        pg_close($pgConnection);

        return $escaped;
    }
}
