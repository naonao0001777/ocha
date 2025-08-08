<?php

require_once(__DIR__ . '/../interfaces/UserRepositoryInterface.php');
require_once(__DIR__ . '/../models/User.php');
require_once(__DIR__ . '/../database/DatabaseConnection.php');
require_once(__DIR__ . '/../database/statement.php');

class UserRepository implements UserRepositoryInterface
{
    private DatabaseConnection $dbConnection;

    public function __construct(DatabaseConnection $dbConnection)
    {
        $this->dbConnection = $dbConnection;
    }

    public function findByUserId(string $userId): ?User
    {
        $sql = DatabaseStatement::SELECT_USER_ID;
        $result = $this->dbConnection->fetchOne($sql, [':userId' => $userId]);
        
        return $result ? User::fromArray($result) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $sql = "SELECT * FROM users WHERE mail = :email";
        $result = $this->dbConnection->fetchOne($sql, [':email' => $email]);
        
        return $result ? User::fromArray($result) : null;
    }

    public function findByEmailOrUserId(string $emailOrUserId, string $userId): ?User
    {
        $sql = DatabaseStatement::SELECT_USER_ID_MAIL;
        $result = $this->dbConnection->fetchOne($sql, [
            ':userMail' => $emailOrUserId,
            ':userId' => $userId
        ]);
        
        return $result ? User::fromArray($result) : null;
    }

    public function findByAutoLoginToken(string $autoLoginToken): ?User
    {
        $sql = DatabaseStatement::SELECT_USER_AUTO;
        $result = $this->dbConnection->fetchOne($sql, [':autoLoginToken' => $autoLoginToken]);
        
        return $result ? User::fromArray($result) : null;
    }

    public function create(User $user): bool
    {
        $sql = DatabaseStatement::INSERT_USER_USERS;
        return $this->dbConnection->execute($sql, [
            ':userId' => $user->getUserId(),
            ':userPassword' => $user->getPassword(),
            ':userMail' => $user->getMail(),
            ':userName' => $user->getUserName()
        ]);
    }

    public function update(User $user): bool
    {
        $sql = "UPDATE users SET 
                password = :password, 
                mail = :mail, 
                user_name = :userName,
                profile_image = :profileImage,
                image_byte = :imageByte,
                biography = :biography,
                auto_login = :autoLogin,
                auto_login_token = :autoLoginToken,
                youtube_account = :youtubeAccount,
                x_account = :xAccount,
                twitch_account = :twitchAccount,
                github_account = :githubAccount,
                instagram_account = :instagramAccount,
                facebook_account = :facebookAccount
                WHERE user_id = :userId";

        return $this->dbConnection->execute($sql, [
            ':userId' => $user->getUserId(),
            ':password' => $user->getPassword(),
            ':mail' => $user->getMail(),
            ':userName' => $user->getUserName(),
            ':profileImage' => $user->getProfileImage(),
            ':imageByte' => $user->getImageByte(),
            ':biography' => $user->getBiography(),
            ':autoLogin' => $user->isAutoLogin(),
            ':autoLoginToken' => $user->getAutoLoginToken(),
            ':youtubeAccount' => $user->getYoutubeAccount(),
            ':xAccount' => $user->getXAccount(),
            ':twitchAccount' => $user->getTwitchAccount(),
            ':githubAccount' => $user->getGithubAccount(),
            ':instagramAccount' => $user->getInstagramAccount(),
            ':facebookAccount' => $user->getFacebookAccount()
        ]);
    }

    public function delete(string $userId): bool
    {
        $sql = DatabaseStatement::DELETE_USER;
        return $this->dbConnection->execute($sql, [':userId' => $userId]);
    }

    public function updateProfileImage(string $userId, ?string $fileName, ?string $imageByte): bool
    {
        $sql = DatabaseStatement::UPDATE_FILE_USERS;
        return $this->dbConnection->execute($sql, [
            ':uploadedFileName' => $fileName,
            ':imageByte' => $imageByte,
            ':userId' => $userId
        ]);
    }

    public function updateUserInformation(string $userId, string $userName, string $biography): bool
    {
        $sql = DatabaseStatement::UPDATE_INFORMATION_USERS;
        return $this->dbConnection->execute($sql, [
            ':userName' => $userName,
            ':updateBiography' => $biography,
            ':userId' => $userId
        ]);
    }

    public function updateAutoLogin(string $userId, bool $autoLoginCheck, ?string $autoLoginToken): bool
    {
        $sql = DatabaseStatement::UPDATE_AUTO_USERS;
        return $this->dbConnection->execute($sql, [
            ':autoLoginCheck' => $autoLoginCheck,
            ':autoLoginToken' => $autoLoginToken,
            ':userId' => $userId
        ]);
    }

    public function updateSnsAccounts(string $userId, array $snsAccounts): bool
    {
        $sql = DatabaseStatement::UPDATE_SNS_USERS;
        return $this->dbConnection->execute($sql, [
            ':updateYoutube' => $snsAccounts['youtube'] ?? null,
            ':updateX' => $snsAccounts['x'] ?? null,
            ':updateTwitch' => $snsAccounts['twitch'] ?? null,
            ':updateGithub' => $snsAccounts['github'] ?? null,
            ':updateInstagram' => $snsAccounts['instagram'] ?? null,
            ':updateFacebook' => $snsAccounts['facebook'] ?? null,
            ':userId' => $userId
        ]);
    }
}
