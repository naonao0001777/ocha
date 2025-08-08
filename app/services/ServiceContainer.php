<?php

require_once(__DIR__ . '/../database/DatabaseConnection.php');
require_once(__DIR__ . '/../repositories/UserRepository.php');
require_once(__DIR__ . '/../services/UserService.php');
require_once(__DIR__ . '/../services/FileUploadService.php');

class ServiceContainer
{
    private static ?ServiceContainer $instance = null;
    private array $services = [];

    private function __construct()
    {
        // Singleton pattern
    }

    public static function getInstance(): ServiceContainer
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * サービスの登録
     * @param string $name
     * @param callable $factory
     */
    public function register(string $name, callable $factory): void
    {
        $this->services[$name] = $factory;
    }

    /**
     * サービスの取得
     * @param string $name
     * @return mixed
     */
    public function get(string $name)
    {
        if (!isset($this->services[$name])) {
            throw new InvalidArgumentException("Service '{$name}' not found.");
        }

        // ファクトリー関数を実行してインスタンスを生成
        return $this->services[$name]();
    }

    /**
     * デフォルトサービスの初期化
     */
    public function initializeDefaultServices(): void
    {
        // データベース接続
        $this->register('database', function() {
            return new DatabaseConnection();
        });

        // ファイルアップロードサービス
        $this->register('fileUpload', function() {
            return new FileUploadService();
        });

        // ユーザーリポジトリ
        $this->register('userRepository', function() {
            return new UserRepository($this->get('database'));
        });

        // ユーザーサービス
        $this->register('userService', function() {
            return new UserService(
                $this->get('userRepository'),
                $this->get('fileUpload')
            );
        });
    }

    /**
     * DatabaseConnection のインスタンスを取得
     * @return DatabaseConnection
     */
    public function getDatabaseConnection(): DatabaseConnection
    {
        return $this->get('database');
    }

    /**
     * UserService のインスタンスを取得
     * @return UserService
     */
    public function getUserService(): UserService
    {
        return $this->get('userService');
    }

    /**
     * UserRepository のインスタンスを取得
     * @return UserRepository
     */
    public function getUserRepository(): UserRepository
    {
        return $this->get('userRepository');
    }

    /**
     * FileUploadService のインスタンスを取得
     * @return FileUploadService
     */
    public function getFileUploadService(): FileUploadService
    {
        return $this->get('fileUpload');
    }
}
