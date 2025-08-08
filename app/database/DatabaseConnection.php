<?php

require_once(__DIR__ . '/../interfaces/DatabaseConnectionInterface.php');
require_once(__DIR__ . '/../config/config.php');

class DatabaseConnection implements DatabaseConnectionInterface
{
    private ?PDO $connection = null;

    public function getConnection(): PDO
    {
        if ($this->connection === null) {
            try {
                $this->connection = new PDO(DATABASE_CONNECTION, DB_USER, DB_PASSWORD, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                throw new Exception("データベース接続に失敗しました: " . $e->getMessage());
            }
        }

        return $this->connection;
    }

    public function closeConnection(): void
    {
        $this->connection = null;
    }

    /**
     * プリペアドステートメントを実行する
     * @param string $sql
     * @param array $params
     * @return PDOStatement
     */
    public function executeQuery(string $sql, array $params = []): PDOStatement
    {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("クエリの実行に失敗しました: " . $e->getMessage());
        }
    }

    /**
     * データを選択する
     * @param string $sql
     * @param array $params
     * @return array|null
     */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->executeQuery($sql, $params);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * 複数のデータを選択する
     * @param string $sql
     * @param array $params
     * @return array
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->executeQuery($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * データを挿入・更新・削除する
     * @param string $sql
     * @param array $params
     * @return bool
     */
    public function execute(string $sql, array $params = []): bool
    {
        $stmt = $this->executeQuery($sql, $params);
        return $stmt->rowCount() > 0;
    }
}
