<?php

require_once(__DIR__ . '/../config/config.php');

class PostgreSQLConnection
{
    private static $connection = null;

    /**
     * PostgreSQL接続を取得
     * @return resource
     */
    public static function getConnection()
    {
        if (self::$connection === null) {
            self::$connection = pg_connect(POSTGRES_CONNECTION);
            if (!self::$connection) {
                throw new Exception("PostgreSQL接続に失敗しました");
            }
        }
        return self::$connection;
    }

    /**
     * 接続を閉じる
     */
    public static function closeConnection()
    {
        if (self::$connection) {
            pg_close(self::$connection);
            self::$connection = null;
        }
    }

    /**
     * パラメータ化クエリを実行（prepare/executeの代替）
     * @param string $sql
     * @param array $params
     * @return resource|false
     */
    public static function queryParams(string $sql, array $params = [])
    {
        $connection = self::getConnection();
        
        // PostgreSQL用のパラメータプレースホルダーに変換 (:param → $1, $2, ...)
        $convertedSql = self::convertPlaceholders($sql, $params);
        
        if (empty($params)) {
            return pg_query($connection, $convertedSql);
        }
        
        return pg_query_params($connection, $convertedSql, array_values($params));
    }

    /**
     * プリペアドステートメントを使用（prepare/executeの代替）
     * @param string $statementName
     * @param string $sql
     * @param array $params
     * @return resource|false
     */
    public static function prepareAndExecute(string $statementName, string $sql, array $params = [])
    {
        $connection = self::getConnection();
        
        // PostgreSQL用のパラメータプレースホルダーに変換
        $convertedSql = self::convertPlaceholders($sql, $params);
        
        // プリペアドステートメントを準備
        $prepareResult = pg_prepare($connection, $statementName, $convertedSql);
        if (!$prepareResult) {
            return false;
        }
        
        // 実行
        return pg_execute($connection, $statementName, array_values($params));
    }

    /**
     * プレースホルダーをPostgreSQL形式に変換
     * @param string $sql
     * @param array $params
     * @return string
     */
    private static function convertPlaceholders(string $sql, array &$params): string
    {
        $paramIndex = 1;
        $orderedParams = [];
        
        // 名前付きプレースホルダー (:param) を位置指定パラメータ ($1, $2, ...) に変換
        $convertedSql = preg_replace_callback('/:\w+/', function($matches) use (&$paramIndex, &$orderedParams, $params) {
            $placeholder = $matches[0];
            if (isset($params[$placeholder])) {
                $orderedParams[] = $params[$placeholder];
                return '$' . $paramIndex++;
            }
            return $placeholder;
        }, $sql);
        
        // パラメータ配列を順序付きに更新
        $params = $orderedParams;
        
        return $convertedSql;
    }

    /**
     * 結果を連想配列として取得
     * @param resource $result
     * @return array|false
     */
    public static function fetchAssoc($result)
    {
        return pg_fetch_assoc($result);
    }

    /**
     * 全ての結果を連想配列として取得
     * @param resource $result
     * @return array
     */
    public static function fetchAllAssoc($result): array
    {
        $rows = [];
        while ($row = pg_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    /**
     * 影響を受けた行数を取得
     * @param resource $result
     * @return int
     */
    public static function affectedRows($result): int
    {
        return pg_affected_rows($result);
    }

    /**
     * エラーメッセージを取得
     * @return string
     */
    public static function getLastError(): string
    {
        $connection = self::getConnection();
        return pg_last_error($connection);
    }

    /**
     * バイナリデータをエスケープ
     * @param string $data
     * @return string
     */
    public static function escapeBytea(string $data): string
    {
        $connection = self::getConnection();
        return pg_escape_bytea($connection, $data);
    }
}
