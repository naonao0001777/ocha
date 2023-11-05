<?php session_start();
require_once('../database/connection.php');
require_once('../database/statement.php');
require_once('../config/config.php');
require_once('../config/message.php');

// 自動ログイン処理
try {
    $autoLoginToken = $_COOKIE['ocha_auto_login'];
    if (isset($autoLoginToken)) {
        $dbh = DatabaseConnection::Connection();
        $sql = DatabaseStatement::SELECT_USER_AUTO;
        $stmt = $dbh->prepare($sql);
        $stmt->bindValue(':autoLoginToken', $autoLoginToken);
        $stmt->execute();
        $fetchedUser = $stmt->fetch();

        $token = bin2hex(random_bytes(32));
        $_SESSION["token"] = $token;

        $msg = message::LOGINED;
        $_SESSION['userId'] = $fetchedUser['user_id'];
        $_SESSION['profileImage'] = $fetchedUser['profile_image'];
        $_SESSION['msg'] = $msg;

        header('Location: ../view/admin');
        exit;
    }
} catch (PDOException $e) {
    $msg = $e->getMessage();
    $_SESSION['msg'] = $msg;

    header('Location: ../view/login');
}
?>

<!DOCTYPE html>
<html lang="ja" data-bs-theme="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="shortcut icon" type="image/x-icon" href="../assets/favicon.ico" />
    <title>register</title>
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
                <form method="post" action="../routes/route">
                    <div class="">
                        <button type="submit" class="btn btn-outline-warning btn-sm mx-1" id="demo" name="demoLogin" value="demoLogin">DEMO</button>
                    </div>
                </form>
                <form method="post" action="./login">
                    <div class="">
                        <button type="submit" class="btn btn-outline-secondary btn-sm mx-1" name="loginNav" id="loginNav">Sign in</button>
                    </div>
                </form>
                <form method="post" action="./register">
                    <div class="">
                        <button type="submit" class="btn btn-success btn-sm mx-1" name="registerNav" id="registerNav">Sign up</button>
                    </div>
                </form>
            </div>
        </div>
    </nav>
    <div class="container-sm">
        <div class="row justify-content-md-center mt-4">
            <div class="col-lg-4 col-xs-2"></div>
            <div class="col-lg-4 col-xs-8 border border-success-subtle">
                <h4 class="text-center p-2">Ocha<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                        <style>
                            svg {
                                fill: #b2f202
                            }
                        </style>
                        <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                    </svg>アカウントを作成</h4>
                <form method="post" action="../routes/route.php" name="register" class="needs-validation" novalidate>
                    <div class="mb-3 form-floating">
                        <input type="text" class="form-control" id="userId" name="userId" maxlength="100" pattern="[a-zA-Z0-9\-]+" placeholder="" autocomplete="off" required>
                        <label for="userId">User ID</label>
                    </div>
                    <div class="mb-3 form-floating">
                        <input type="email" class="form-control" id="userMail" name="userMail" placeholder="" autocomplete="off" required>
                        <label for="userId">Email address</label>
                        <div class="invalid-feedback">
                            "@"を含むメールアドレスを使用してください
                        </div>
                    </div>
                    <div class="mb-3 form-floating">
                        <input type="password" class="form-control" id="userPassword" name="userPassword" maxlength="100" minlength="5" placeholder="" required>
                        <label for="userPassword">Password</label>
                        <div class="invalid-feedback">
                            5文字以上入力してください
                        </div>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required>
                        <label class="form-check-label" for="invalidCheck">
                            データの取扱いに同意します
                        </label>
                    </div>
                    <div class="mb-3 text-center">
                        <label for="message" class="form-label text-center"><?php echo $_SESSION['msg']; ?></label>
                    </div>
                    <div class="mb-3">
                        <div class="col d-grid gap-2 col-6 mx-auto text-center">
                            <button type="submit" class="btn btn-success" name="register" value="register">Sign up</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="col-lg-4 col-xs-2"></div>
        </div>
    </div>
</body>

</html>
<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<script>
    // フォームコントロールのバリデーション
    $(function() {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
            .forEach(function(form) {
                form.addEventListener('submit', function(event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }

                    form.classList.add('was-validated')
                }, false)
            })
    })();

    // 最初にIDのフォームにフォーカスをする
    $('input:visible').eq(0).focus();

    $()
</script>
<?php session_destroy(); ?>