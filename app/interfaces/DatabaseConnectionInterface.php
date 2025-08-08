<?php

interface DatabaseConnectionInterface
{
    /**
     * データベース接続を取得する
     * @return PDO
     */
    public function getConnection(): PDO;

    /**
     * 接続を閉じる
     */
    public function closeConnection(): void;
}
