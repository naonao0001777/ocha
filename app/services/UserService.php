<?php

require_once(__DIR__ . '/../repositories/UserRepository.php');
require_once(__DIR__ . '/../services/FileUploadService.php');
require_once(__DIR__ . '/../models/User.php');
require_once(__DIR__ . '/../config/message.php');

class UserService
{
    private UserRepository $userRepository;
    private FileUploadService $fileUploadService;

    public function __construct(UserRepository $userRepository, FileUploadService $fileUploadService)
    {
        $this->userRepository = $userRepository;
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * プロフィール画像の更新
     * @param string $userId
     * @param array $fileInfo
     * @return array
     */
    public function updateProfileImage(string $userId, array $fileInfo): array
    {
        try {
            // ファイルのバリデーション
            $errors = $this->fileUploadService->validateFile($fileInfo);
            if (!empty($errors)) {
                return ['success' => false, 'message' => implode(', ', $errors)];
            }

            // ファイル拡張子の取得
            $extension = $this->fileUploadService->getFileExtension($fileInfo['tmp_name']);
            if (!$extension) {
                return ['success' => false, 'message' => message::CHANGE_IMAGE_EXT];
            }

            // ユニークなファイル名の生成
            $fileName = $this->fileUploadService->generateUniqueFileName($extension);

            // 画像のリサイズ
            if (!$this->fileUploadService->resizeImage($fileInfo['tmp_name'], $extension)) {
                return ['success' => false, 'message' => '画像のリサイズに失敗しました'];
            }

            // ユーザーディレクトリの作成
            if (!$this->fileUploadService->createUserDirectory($userId)) {
                return ['success' => false, 'message' => 'ディレクトリの作成に失敗しました'];
            }

            // 既存の画像を削除
            $existingUser = $this->userRepository->findByUserId($userId);
            if ($existingUser && $existingUser->getProfileImage()) {
                $this->fileUploadService->deleteFile($userId, $existingUser->getProfileImage());
            }

            // ファイルの移動
            if (!$this->fileUploadService->moveUploadedFile($fileInfo['tmp_name'], $userId, $fileName)) {
                return ['success' => false, 'message' => 'ファイルの保存に失敗しました'];
            }

            // PostgreSQL用のバイナリデータの準備
            $imageByte = $this->fileUploadService->prepareImageByte($userId, $fileName);

            // データベースの更新
            if (!$this->userRepository->updateProfileImage($userId, $fileName, $imageByte)) {
                // 失敗した場合はファイルを削除
                $this->fileUploadService->deleteFile($userId, $fileName);
                return ['success' => false, 'message' => 'データベースの更新に失敗しました'];
            }

            return [
                'success' => true, 
                'message' => message::UPDATE_IMAGE,
                'fileName' => $fileName,
                'imageByte' => $imageByte
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * プロフィール画像の削除
     * @param string $userId
     * @return array
     */
    public function deleteProfileImage(string $userId): array
    {
        try {
            // 既存のユーザー情報を取得
            $user = $this->userRepository->findByUserId($userId);
            if (!$user) {
                return ['success' => false, 'message' => 'ユーザーが見つかりません'];
            }

            // 既存の画像ファイルを削除
            if ($user->getProfileImage()) {
                $this->fileUploadService->deleteFile($userId, $user->getProfileImage());
            }

            // データベースの更新
            if (!$this->userRepository->updateProfileImage($userId, null, null)) {
                return ['success' => false, 'message' => 'データベースの更新に失敗しました'];
            }

            return ['success' => true, 'message' => message::DELETE_IMAGE];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * ユーザー情報の更新
     * @param string $userId
     * @param string $userName
     * @param string $biography
     * @return array
     */
    public function updateUserInformation(string $userId, string $userName, string $biography): array
    {
        try {
            if (!$this->userRepository->updateUserInformation($userId, $userName, $biography)) {
                return ['success' => false, 'message' => 'ユーザー情報の更新に失敗しました'];
            }

            return ['success' => true, 'message' => 'ユーザー情報を更新しました'];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * SNSアカウント情報の更新
     * @param string $userId
     * @param array $snsAccounts
     * @return array
     */
    public function updateSnsAccounts(string $userId, array $snsAccounts): array
    {
        try {
            if (!$this->userRepository->updateSnsAccounts($userId, $snsAccounts)) {
                return ['success' => false, 'message' => 'SNSアカウント情報の更新に失敗しました'];
            }

            return ['success' => true, 'message' => 'SNSアカウント情報を更新しました'];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * ユーザーの取得
     * @param string $userId
     * @return User|null
     */
    public function getUserById(string $userId): ?User
    {
        return $this->userRepository->findByUserId($userId);
    }

    /**
     * ユーザーの作成
     * @param string $userId
     * @param string $password
     * @param string $email
     * @param string $userName
     * @return array
     */
    public function createUser(string $userId, string $password, string $email, string $userName): array
    {
        try {
            $user = new User($userId, $password, $email, $userName);
            
            if (!$this->userRepository->create($user)) {
                return ['success' => false, 'message' => 'ユーザーの作成に失敗しました'];
            }

            return ['success' => true, 'message' => 'ユーザーを作成しました'];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * ユーザーの削除
     * @param string $userId
     * @return array
     */
    public function deleteUser(string $userId): array
    {
        try {
            // 関連ファイルの削除
            $user = $this->userRepository->findByUserId($userId);
            if ($user && $user->getProfileImage()) {
                $this->fileUploadService->deleteFile($userId, $user->getProfileImage());
            }

            if (!$this->userRepository->delete($userId)) {
                return ['success' => false, 'message' => 'ユーザーの削除に失敗しました'];
            }

            return ['success' => true, 'message' => 'ユーザーを削除しました'];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
