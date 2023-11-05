<?php session_start();
if (!isset($_SESSION['token'])) {
    header('Location: ./login');
    exit;
} else {

    try {
        require_once('../database/connection.php');
        require_once('../database/statement.php');
        require_once('../config/config.php');
        require_once('../config/message.php');

        $dbh = DatabaseConnection::Connection();

        $userId = $_SESSION['userId'];

        $sql = DatabaseStatement::SELECT_USER_ID;
        $stmt = $dbh->prepare($sql);
        $stmt->bindValue(':userId', $userId);
        $stmt->execute();
        $fetchedUser = $stmt->fetch();
        $_SESSION['userName'] = $fetchedUser['user_name'];
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        $_SESSION['msg'] = $msg;
        header('Location: ../index');
        exit;
    }
} ?>

<!DOCTYPE html>
<html lang="ja" data-bs-theme="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <!-- <link href="../resource/node_modules/bootstrap/scss/mixins/_caret.scss" rel="stylesheet" />
    <link href="../resource/node_modules/bootstrap/scss/_variables.scss" rel="stylesheet" /> -->
    <link rel="stylesheet" href="../resource/css/style.css" />
    <link rel="shortcut icon" type="image/x-icon" href="../assets/favicon.ico" />
    <title>admin</title>
</head>

<body>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" href="../index">Ocha<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <style>
                        svg {
                            fill: #b2f202
                        }
                    </style>
                    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                </svg></a>
            <div class="d-flex ms-auto">
                <div class="dropdown ">
                    <button type="button" class="btn btn-outline-secondary btn-sm mx-1 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        ≡
                    </button>
                    <form method="post" action="../routes/route.php">
                        <ul class="dropdown-menu dropdown-menu-end text-center">
                            <li><button type="submit" class="dropdown-item" name="userInformation" id="userInformation" value="userInformation">Settings</button></li>
                            <li><button type="submit" class="dropdown-item" name="logout" id="logout" value="logout">Logout</button></li>
                            <?php if ($_SESSION["token"] != "guestUserLoginToken") {
                                echo '<li><button type="button" class="btn btn-danger btn-sm mx-1 rounded-pill mt-1" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">Delete Account</button></li>';
                            } ?>
                        </ul>
                    </form>
                </div>
                <!--アカウント削除モーダル-->
                <div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="deleteAccountModalLabel">本当にアカウントを削除しますか？</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                新たにメールアドレスとIDとパスワードを設定できます。
                            </div>
                            <div class="modal-footer">
                                <form method="post" action="../routes/deleteAccount.php">
                                    <button type="submit" class="btn btn-danger" id="deleteAccount" name="deleteAccount" value="deleteAccount">削除</button>
                                    <input type="hidden" name="deleteAccountHidden" value="deleteAccountHidden">
                                </form>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    <div class="container-sm">
        <?php
        if ($_SESSION['msgFlag']) {
            echo '<div class="alert alert-warning alert-dismissible fade show" role="center">';
            echo $_SESSION['msg'];
            echo '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
            echo '</div>';
        }
        unset($_SESSION['msgFlag']);
        ?>
        <h4 class="text-center p-2">ユーザー情報<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <style>
                    svg {
                        fill: #b2f202
                    }
                </style>
                <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
            </svg></h4>
        <div class="row justify-content-md-center mt-4">
            <div class="col-lg-4 col-xs-2"></div>
            <div class="col-lg-4 col-xs-8">
                <div class="mb-3">
                    <fieldset disabled>
                        <label for="basic-url" class="form-label">プロフィールURL</label>
                        <div class="input-group">
                            <span class="input-group-text" id="basic-addon3">
                                <?php echo $_SERVER["HTTP_HOST"] . "/u/" ?>
                            </span>
                            <input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3 basic-addon4" value="<?php echo $_SESSION['userId'] ?>" autocomplete="off" required>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div class="col-lg-4 col-xs-2"></div>
        </div>
        <div class="row justify-content-md-center mt-4">
            <div class="col-lg-4 col-xs-2"></div>
            <div class="col-lg-4 col-xs-8">
                <form method="post" action="../routes/route">
                    <div class="mb-3">
                        <label for="basic-url" class="form-label">ユーザー名</label>
                        <input type="text" class="form-control" id="updateUserName" name="updateUserName" placeholder="Name" value="<?php echo $_SESSION['userName'] ?>" autocomplete="off" required>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" type="submit" id="update" name="update">
                            変更する
                        </button>
                    </div>
                </form>
            </div>
            <div class="col-lg-4 col-xs-2"></div>
        </div>
        <div class="row justify-content-md-center mt-4">
            <div class="col-lg-4 col-xs-2"></div>
            <div class="col-lg-4 col-xs-8">
                <div class="mb-3">
                    <fieldset disabled>
                        <label for="basic-url" class="form-label">メールアドレス</label>
                        <input type="text" class="form-control" placeholder="Email Address" value="<?php echo $_SESSION['userMail'] ?>" autocomplete="off" required>
                    </fieldset>
                </div>
            </div>
            <div class="col-lg-4 col-xs-2"></div>
        </div>
        <form method="post" action="../routes/route">
            <div class="row justify-content-md-center mt-4">
                <div class="col-lg-4 col-xs-2"></div>
                <div class="col-lg-4 col-xs-8 text-center">
                    <button type="submit" class="btn btn-primary btn-md mx-1" name="userAdmin" id="userAdmin" value="userAdmin">管理画面へ戻る</button>
                </div>
                <div class="col-lg-4 col-xs-2"></div>
            </div>
        </form>
</body>

</html>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<script src="../resource/js/jquery.cookie.js"></script>
<script>
    // ツールチップ
    $(function() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    });
    // ポップオーバー
    $(function() {
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    });
    // トースト
    const toastTrigger = document.getElementById('liveToastBtn')
    const toastLiveExample = document.getElementById('liveToast')

    if (toastTrigger) {
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastTrigger.addEventListener('click', () => {
            toastBootstrap.show()
        })
    }
</script>