<?php
session_start();

require_once('../database/PostgreSQLConnection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

$userId = $_POST['userId'] ?? '';
$userMail = $_POST['userMail'] ?? '';
$loginFlag = $_POST['login'] ?? null;
$logoutFlag = $_POST['logout'] ?? null;
$registerFlag = $_POST['register'] ?? null;
$userInformationFlag = $_POST['userInformation'] ?? null;
$updateUserName = $_POST['updateUserName'] ?? '';
$updateBiography = $_POST['biography'] ?? '';
$userAdminFlag = $_POST['userAdmin'] ?? null;
$autoLoginCheck = $_POST['autoLogin'] ?? null;
$guestUserLogin = $_POST['demoLogin'] ?? null;

if (isset($logoutFlag)) {
    // ログアウト処理
    unset($_SESSION['msg']);
    setcookie("ocha_auto_login", "", time() - 20 * 24 * 60 * 60, '/', false);
    session_destroy();
    header('Location: ../view/login');
    exit;
} elseif (isset($loginFlag)) {
    // ログイン処理
    try {
        if (!($_SESSION['token'] ?? null) || $_SESSION['token'] !== ($_POST['token'] ?? '')) {
            $_SESSION['msg'] = "不正なアクセス";
            session_destroy();
            header('Location: ../view/login');
            exit;
        } else {
            $userPassword = $_POST['userPassword'] ?? '';

            $sql = DatabaseStatement::SELECT_USER_ID;
            $result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
            
            if (!$result) {
                throw new Exception("ユーザー情報の取得に失敗しました: " . PostgreSQLConnection::getLastError());
            }
            
            $fetchedUser = PostgreSQLConnection::fetchAssoc($result);

            if (!$fetchedUser) {
                $msg = message::UNMATCH_USER_PASSWORD;
                $_SESSION['msg'] = $msg;
                header('Location: ../view/login');
            } else {
                // パスワードチェック
                if (password_verify($userPassword, $fetchedUser['password'])) {
                    $msg = message::LOGINED;
                    $_SESSION['userId'] = $fetchedUser['user_id'];
                    $_SESSION['profileImage'] = $fetchedUser['profile_image'];
                    $_SESSION['msg'] = $msg;
                    $sessionToken = $_SESSION['token'];

                    // 自動ログインチェック
                    if (isset($autoLoginCheck) && $autoLoginCheck == "on") {
                        $autoLoginToken = 'auto_login_' . bin2hex(random_bytes(32));

                        $sql = DatabaseStatement::UPDATE_AUTO_USERS;
                        $result = PostgreSQLConnection::queryParams($sql, [
                            ':autoLoginCheck' => true,
                            ':autoLoginToken' => $autoLoginToken,
                            ':userId' => $userId
                        ]);
                        
                        if (!$result) {
                            throw new Exception("自動ログイン設定の更新に失敗しました: " . PostgreSQLConnection::getLastError());
                        }

                        setcookie('ocha_auto_login', $autoLoginToken, time() + 20 * 24 * 60 * 60, '/', false);
                    } else {
                        $sql = DatabaseStatement::UPDATE_AUTO_USERS;
                        $result = PostgreSQLConnection::queryParams($sql, [
                            ':autoLoginCheck' => false,
                            ':autoLoginToken' => null,
                            ':userId' => $userId
                        ]);
                        
                        if (!$result) {
                            throw new Exception("自動ログイン設定の更新に失敗しました: " . PostgreSQLConnection::getLastError());
                        }

                        setcookie('ocha_auto_login', '', time() - 20 * 24 * 60 * 60, '/', false);
                    }
                    $_SESSION['msgFlag'] = true;

                    header('Location: ../view/admin');
                } else {
                    $msg = message::UNMATCH_USER_PASSWORD;
                    $_SESSION['msg'] = $msg;
                    header('Location: ../view/login');
                }
            }
        }
    } catch (Exception $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../index');
    }
} elseif (isset($registerFlag)) {
    //新規登録処理
    try {
        $userPassword = password_hash($_POST['userPassword'], PASSWORD_DEFAULT);

        $sql = DatabaseStatement::SELECT_USER_ID_MAIL;
        $result = PostgreSQLConnection::queryParams($sql, [
            ':userMail' => $userMail,
            ':userId' => $userId
        ]);
        
        if (!$result) {
            throw new Exception("ユーザー情報の確認に失敗しました: " . PostgreSQLConnection::getLastError());
        }
        
        $fetchedUser = PostgreSQLConnection::fetchAssoc($result);

        // アカウントを登録
        if ($fetchedUser && $fetchedUser['mail'] == $userMail) {
            $msg = message::MAIL_IS_USED;
            $_SESSION['msg'] = $msg;
            header("Location: ../view/register");
        } elseif ($fetchedUser && $fetchedUser['user_id'] == $userId) {
            $msg = message::USER_ID_IS_USED;
            $_SESSION['msg'] = $msg;
            header("Location: ../view/register");
        } else {
            $sql = DatabaseStatement::INSERT_USER_USERS;
            $result = PostgreSQLConnection::queryParams($sql, [
                ':userId' => $userId,
                ':userMail' => $userMail,
                ':userPassword' => $userPassword,
                ':userName' => $userId
            ]);
            
            if (!$result) {
                throw new Exception("ユーザーの作成に失敗しました: " . PostgreSQLConnection::getLastError());
            }

            //LinksテーブルにもユーザーIDを挿入
            $sql = DatabaseStatement::INSERT_USER_LINKS;
            $result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
            
            if (!$result) {
                throw new Exception("ユーザーリンクの作成に失敗しました: " . PostgreSQLConnection::getLastError());
            }
            
            $_SESSION['userId'] = $userId;
            $msg = message::REGISTERD;
            header('Location: ../view/login');
        }
    } catch (Exception $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../view/register');
    }
} elseif (isset($guestUserLogin) && $guestUserLogin == 'demoLogin') {
    try {
        $userPassword = "guestpassword";

        $sql = DatabaseStatement::SELECT_USER_ID;
        $result = PostgreSQLConnection::queryParams($sql, [':userId' => "guest"]);
        
        if (!$result) {
            throw new Exception("ゲストユーザー情報の取得に失敗しました: " . PostgreSQLConnection::getLastError());
        }
        
        $fetchedUser = PostgreSQLConnection::fetchAssoc($result);
        $_SESSION['msgFlag'] = true;
        
        if ($fetchedUser && password_verify($userPassword, $fetchedUser['password'])) {
            $_SESSION['userId'] = $fetchedUser['user_id'];
            $_SESSION['profileImage'] = $fetchedUser['profile_image'];

            $msg = message::LOGGED_IN_GUEST;
            $_SESSION['msg'] = $msg;

            $token = "guestUserLoginToken";
            $_SESSION["token"] = $token;

            header('Location: ../view/admin');
        } else {
            $msg = message::LOGGED_IN_GUEST_ERROR;
            $_SESSION['msg'] = $msg;
            header('Location: ../index');
        }
    } catch (Exception $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../index');
    }
} elseif (isset($userInformationFlag) && $userInformationFlag == 'userInformation') {
    header('Location: ../view/userInformation');
} elseif (isset($userAdminFlag) && $userAdminFlag == 'userAdmin') {
    header('Location: ../view/admin');
} elseif (isset($updateUserName) || isset($updateBiography)) {
    try {
        $sql = DatabaseStatement::UPDATE_INFORMATION_USERS;
        $result = PostgreSQLConnection::queryParams($sql, [
            ':userName' => $updateUserName,
            ':updateBiography' => $updateBiography,
            ':userId' => $_SESSION['userId']
        ]);
        
        if (!$result) {
            throw new Exception("ユーザー情報の更新に失敗しました: " . PostgreSQLConnection::getLastError());
        }
        
        $_SESSION['msgFlag'] = true;
        $_SESSION['msg'] = message::UPDATED_USER_INFORMATION;

        header('Location: ../view/userInformation');
    } catch (Exception $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../index');
    }
} else {
    header('Location: ../view/userInformation');
}
