<?php

class User
{
    private string $userId;
    private string $password;
    private string $mail;
    private string $userName;
    private ?string $profileImage;
    private ?string $imageByte;
    private ?string $biography;
    private bool $autoLogin;
    private ?string $autoLoginToken;
    private ?string $youtubeAccount;
    private ?string $xAccount;
    private ?string $twitchAccount;
    private ?string $githubAccount;
    private ?string $instagramAccount;
    private ?string $facebookAccount;

    public function __construct(
        string $userId,
        string $password,
        string $mail,
        string $userName,
        ?string $profileImage = null,
        ?string $imageByte = null,
        ?string $biography = null,
        bool $autoLogin = false,
        ?string $autoLoginToken = null,
        ?string $youtubeAccount = null,
        ?string $xAccount = null,
        ?string $twitchAccount = null,
        ?string $githubAccount = null,
        ?string $instagramAccount = null,
        ?string $facebookAccount = null
    ) {
        $this->userId = $userId;
        $this->password = $password;
        $this->mail = $mail;
        $this->userName = $userName;
        $this->profileImage = $profileImage;
        $this->imageByte = $imageByte;
        $this->biography = $biography;
        $this->autoLogin = $autoLogin;
        $this->autoLoginToken = $autoLoginToken;
        $this->youtubeAccount = $youtubeAccount;
        $this->xAccount = $xAccount;
        $this->twitchAccount = $twitchAccount;
        $this->githubAccount = $githubAccount;
        $this->instagramAccount = $instagramAccount;
        $this->facebookAccount = $facebookAccount;
    }

    // Getters
    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getMail(): string
    {
        return $this->mail;
    }

    public function getUserName(): string
    {
        return $this->userName;
    }

    public function getProfileImage(): ?string
    {
        return $this->profileImage;
    }

    public function getImageByte(): ?string
    {
        return $this->imageByte;
    }

    public function getBiography(): ?string
    {
        return $this->biography;
    }

    public function isAutoLogin(): bool
    {
        return $this->autoLogin;
    }

    public function getAutoLoginToken(): ?string
    {
        return $this->autoLoginToken;
    }

    public function getYoutubeAccount(): ?string
    {
        return $this->youtubeAccount;
    }

    public function getXAccount(): ?string
    {
        return $this->xAccount;
    }

    public function getTwitchAccount(): ?string
    {
        return $this->twitchAccount;
    }

    public function getGithubAccount(): ?string
    {
        return $this->githubAccount;
    }

    public function getInstagramAccount(): ?string
    {
        return $this->instagramAccount;
    }

    public function getFacebookAccount(): ?string
    {
        return $this->facebookAccount;
    }

    // Setters
    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function setMail(string $mail): void
    {
        $this->mail = $mail;
    }

    public function setUserName(string $userName): void
    {
        $this->userName = $userName;
    }

    public function setProfileImage(?string $profileImage): void
    {
        $this->profileImage = $profileImage;
    }

    public function setImageByte(?string $imageByte): void
    {
        $this->imageByte = $imageByte;
    }

    public function setBiography(?string $biography): void
    {
        $this->biography = $biography;
    }

    public function setAutoLogin(bool $autoLogin): void
    {
        $this->autoLogin = $autoLogin;
    }

    public function setAutoLoginToken(?string $autoLoginToken): void
    {
        $this->autoLoginToken = $autoLoginToken;
    }

    public function setYoutubeAccount(?string $youtubeAccount): void
    {
        $this->youtubeAccount = $youtubeAccount;
    }

    public function setXAccount(?string $xAccount): void
    {
        $this->xAccount = $xAccount;
    }

    public function setTwitchAccount(?string $twitchAccount): void
    {
        $this->twitchAccount = $twitchAccount;
    }

    public function setGithubAccount(?string $githubAccount): void
    {
        $this->githubAccount = $githubAccount;
    }

    public function setInstagramAccount(?string $instagramAccount): void
    {
        $this->instagramAccount = $instagramAccount;
    }

    public function setFacebookAccount(?string $facebookAccount): void
    {
        $this->facebookAccount = $facebookAccount;
    }

    /**
     * 配列からUserインスタンスを作成
     * @param array $data
     * @return User
     */
    public static function fromArray(array $data): User
    {
        return new self(
            $data['user_id'] ?? '',
            $data['password'] ?? '',
            $data['mail'] ?? '',
            $data['user_name'] ?? '',
            $data['profile_image'] ?? null,
            $data['image_byte'] ?? null,
            $data['biography'] ?? null,
            (bool)($data['auto_login'] ?? false),
            $data['auto_login_token'] ?? null,
            $data['youtube_account'] ?? null,
            $data['x_account'] ?? null,
            $data['twitch_account'] ?? null,
            $data['github_account'] ?? null,
            $data['instagram_account'] ?? null,
            $data['facebook_account'] ?? null
        );
    }

    /**
     * Userインスタンスを配列に変換
     * @return array
     */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'password' => $this->password,
            'mail' => $this->mail,
            'user_name' => $this->userName,
            'profile_image' => $this->profileImage,
            'image_byte' => $this->imageByte,
            'biography' => $this->biography,
            'auto_login' => $this->autoLogin,
            'auto_login_token' => $this->autoLoginToken,
            'youtube_account' => $this->youtubeAccount,
            'x_account' => $this->xAccount,
            'twitch_account' => $this->twitchAccount,
            'github_account' => $this->githubAccount,
            'instagram_account' => $this->instagramAccount,
            'facebook_account' => $this->facebookAccount,
        ];
    }
}
