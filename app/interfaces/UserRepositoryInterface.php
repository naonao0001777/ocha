<?php

require_once(__DIR__ . '/../models/User.php');

interface UserRepositoryInterface
{
    /**
     * ユーザーIDでユーザーを取得
     * @param string $userId
     * @return User|null
     */
    public function findByUserId(string $userId): ?User;

    /**
     * メールアドレスでユーザーを取得
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User;

    /**
     * ユーザーの作成
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool;

    /**
     * ユーザーの更新
     * @param User $user
     * @return bool
     */
    public function update(User $user): bool;

    /**
     * ユーザーの削除
     * @param string $userId
     * @return bool
     */
    public function delete(string $userId): bool;

    /**
     * プロフィール画像の更新
     * @param string $userId
     * @param string|null $fileName
     * @param string|null $imageByte
     * @return bool
     */
    public function updateProfileImage(string $userId, ?string $fileName, ?string $imageByte): bool;

    /**
     * ユーザー情報の更新
     * @param string $userId
     * @param string $userName
     * @param string $biography
     * @return bool
     */
    public function updateUserInformation(string $userId, string $userName, string $biography): bool;

    /**
     * SNSアカウント情報の更新
     * @param string $userId
     * @param array $snsAccounts
     * @return bool
     */
    public function updateSnsAccounts(string $userId, array $snsAccounts): bool;
}
