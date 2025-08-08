<?php

require_once(__DIR__ . '/../config/config.php');

class MySQLConnection
{
    private static $connection = null;

    /**
     * MySQL接続を取得
     * @return mysqli
     */
    public static function getConnection()
    {
        if (self::$connection === null) {
            // DATABASE_CONNECTION文字列を解析
            $dsn = DATABASE_CONNECTION;
            preg_match('/host=([^;]+)/', $dsn, $hostMatch);
            preg_match('/dbname=([^;]+)/', $dsn, $dbMatch);
            
            $host = $hostMatch[1] ?? 'localhost';
            $database = $dbMatch[1] ?? 'ocha';
            
            self::$connection = new mysqli($host, DB_USER, DB_PASSWORD, $database);
            
            if (self::$connection->connect_error) {
                throw new Exception("MySQL接続に失敗しました: " . self::$connection->connect_error);
            }
            
            self::$connection->set_charset("utf8");
        }
        return self::$connection;
    }

    /**
     * 接続を閉じる
     */
    public static function closeConnection()
    {
        if (self::$connection) {
            self::$connection->close();
            self::$connection = null;
        }
    }

    /**
     * パラメータ化クエリを実行（prepare/executeの代替）
     * @param string $sql
     * @param array $params
     * @return mysqli_result|bool
     */
    public static function queryParams(string $sql, array $params = [])
    {
        $connection = self::getConnection();
        
        // 名前付きプレースホルダーを?に変換
        $convertedSql = self::convertPlaceholders($sql, $params);
        
        if (empty($params)) {
            return $connection->query($convertedSql);
        }
        
        $stmt = $connection->prepare($convertedSql);
        if (!$stmt) {
            throw new Exception("プリペアドステートメントの準備に失敗しました: " . $connection->error);
        }
        
        if (!empty($params)) {
            $types = str_repeat('s', count($params)); // すべて文字列として扱う
            $stmt->bind_param($types, ...array_values($params));
        }
        
        if (!$stmt->execute()) {
            throw new Exception("クエリの実行に失敗しました: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $stmt->close();
        
        return $result;
    }

    /**
     * プレースホルダーをMySQL形式に変換
     * @param string $sql
     * @param array $params
     * @return string
     */
    private static function convertPlaceholders(string $sql, array &$params): string
    {
        $orderedParams = [];
        
        // 名前付きプレースホルダー (:param) を位置指定パラメータ (?) に変換
        $convertedSql = preg_replace_callback('/:\w+/', function($matches) use (&$orderedParams, $params) {
            $placeholder = $matches[0];
            if (isset($params[$placeholder])) {
                $orderedParams[] = $params[$placeholder];
                return '?';
            }
            return $placeholder;
        }, $sql);
        
        // パラメータ配列を順序付きに更新
        $params = $orderedParams;
        
        return $convertedSql;
    }

    /**
     * 結果を連想配列として取得
     * @param mysqli_result $result
     * @return array|null
     */
    public static function fetchAssoc($result)
    {
        if (!$result) {
            return null;
        }
        return $result->fetch_assoc();
    }

    /**
     * 全ての結果を連想配列として取得
     * @param mysqli_result $result
     * @return array
     */
    public static function fetchAllAssoc($result): array
    {
        if (!$result) {
            return [];
        }
        
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    /**
     * 影響を受けた行数を取得
     * @param mysqli_result $result
     * @return int
     */
    public static function affectedRows($result = null): int
    {
        $connection = self::getConnection();
        return $connection->affected_rows;
    }

    /**
     * エラーメッセージを取得
     * @return string
     */
    public static function getLastError(): string
    {
        $connection = self::getConnection();
        return $connection->error;
    }

    /**
     * バイナリデータをエスケープ（MySQLではBLOB用）
     * @param string $data
     * @return string
     */
    public static function escapeBytea(string $data): string
    {
        $connection = self::getConnection();
        return $connection->real_escape_string($data);
    }
}
