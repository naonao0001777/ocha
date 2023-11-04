<?php
session_start();

require_once('../database/connection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

$userId = $_POST['userId'];
$userMail = $_POST['userMail'];
$loginFlag = $_POST['login'];
$logoutFlag = $_POST['logout'];
$registerFlag = $_POST['register'];
$autoLoginCheck = $_POST['autoLogin'];
$guestUserLogin = $_POST['demoLogin'];

$dbh = DatabaseConnection::Connection();

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
        if (!$_SESSION['token'] = $_POST['token']) {
            $_SESSION['msg'] = "不正なアクセス";
            session_destroy();
            header('Location: ../view/login');
            exit;
        } else {
            $userPassword = $_POST['userPassword'];

            $sql = DatabaseStatement::SELECT_USER_ID;
            $stmt = $dbh->prepare($sql);
            $stmt->bindValue(':userId', $userId);
            $stmt->execute();
            $fetchedUser = $stmt->fetch();

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
                        $stmt = $dbh->prepare($sql);
                        $stmt->bindValue(':autoLoginCheck', 'true');
                        $stmt->bindValue(':autoLoginToken', $autoLoginToken);
                        $stmt->bindValue(':userId', $userId);
                        $stmt->execute();

                        setcookie('ocha_auto_login', $autoLoginToken, time() + 20 * 24 * 60 * 60, '/', false);
                    } else {
                        $sql = DatabaseStatement::UPDATE_AUTO_USERS;
                        $stmt = $dbh->prepare($sql);
                        $stmt->bindValue(':autoLoginCheck', 'false');
                        $stmt->bindValue(':autoLoginToken', NULL);
                        $stmt->bindValue(':userId', $userId);
                        $stmt->execute();

                        setcookie('ocha_auto_login', '', time() - 20 * 24 * 60 * 60, '/', false);
                    }

                    header('Location: ../view/admin');
                } else {
                    $msg = message::UNMATCH_USER_PASSWORD;
                    $_SESSION['msg'] = $msg;

                    header('Location: ../view/login');
                }
            }
        }
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../index');
    }
} elseif (isset($registerFlag)) {
    //新規登録処理
    try {
        $userPassword = password_hash($_POST['userPassword'], PASSWORD_DEFAULT);

        $sql = DatabaseStatement::SELECT_USER_ID_MAIL;
        $stmt = $dbh->prepare($sql);
        $stmt->bindvalue(':userMail', $userMail);
        $stmt->bindvalue(':userId', $userId);
        $stmt->execute();
        $fetchedUser = $stmt->fetch();

        // アカウントを登録
        if ($fetchedUser['mail'] == $userMail) {
            $msg = message::MAIL_IS_USED;
            $_SESSION['msg'] = $msg;

            header("Location: ../view/register");
        } else {
            if ($fetchedUser['user_id'] == $userId) {
                $msg = message::USER_ID_IS_USED;
                $_SESSION['msg'] = $msg;

                header("Location: ../view/register");
            } else {
                $sql = DatabaseStatement::INSERT_USER_USERS;
                $stmt = $dbh->prepare($sql);
                $stmt->bindvalue(':userId', $userId);
                $stmt->bindvalue(':userMail', $userMail);
                $stmt->bindvalue(':userPassword', $userPassword);
                $stmt->execute();

                //LinksテーブルにもユーザーIDを挿入
                $sql = DatabaseStatement::INSERT_USER_LINKS;
                $stmt = $dbh->prepare($sql);
                $stmt->bindvalue(':userId', $userId);
                $stmt->execute();
                $_SESSION['userId'] = $userId;
                $msg = message::REGISTERD;

                header('Location: ../view/login');
            }
        }
    } catch (PDOException $e) {
        $msg = $e->getMessage();
    }
} elseif (isset($guestUserLogin) && $guestUserLogin == 'demoLogin') {
    try {
        $userPassword = "guestpassword";

        $sql = DatabaseStatement::SELECT_USER_ID;
        $stmt = $dbh->prepare($sql);
        $stmt->bindValue(':userId', "guest");
        $stmt->execute();
        $fetchedUser = $stmt->fetch();
        if (password_verify($userPassword, $fetchedUser['password'])) {
            $msg = message::LOGINED;
            $_SESSION['userId'] = $fetchedUser['user_id'];
            $_SESSION['profileImage'] = $fetchedUser['profile_image'];
            $_SESSION['msg'] = $msg;

            $token = "guestUserLoginToken";
            $_SESSION["token"] = $token;

            header('Location: ../view/admin');
        } else {
            $msg = "ゲストユーザーのパスワードが違います。管理者にお問い合わせください。";
            $_SESSION['msg'] = $msg;
            header('Location: ../view/index');
        }
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../view/index');
    }
}
