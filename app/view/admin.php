<?php session_start();
if (!isset($_SESSION['token'])) {
    header('Location: ./login');
    exit;
} ?>

<!DOCTYPE html>
<html lang="ja" data-bs-theme="">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="stylesheet" href="../resource/css/style.css">
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
                <div class="dropdown dropstart">
                    <button type="button" class="btn btn-outline-secondary btn-sm mx-1 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        ≡
                    </button>
                    <form method="post" action="../routes/route.php">
                        <ul class="dropdown-menu text-center">
                            <li><button type="submit" class="dropdown-item" name="logout" id="logout">Logout</button></li>
                            <li><button type="button" class="btn btn-danger btn-sm mx-1 rounded-pill" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">Delete Account</button></li>
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
    <div class="container-sm text-center">
        <div class="row justify-content-md-center g-2">
            <div class="col"></div>
            <div class="col">
                <img src="../images/<?php echo $_SESSION['userId'] . '/' . $_SESSION['profileImage'] ?>" class="img-thumbnail rounded-circle" width="100px" height="100px" alt="">
            </div>
            <div class="col"></div>
        </div>
        <form method="post" action="../routes/adminEdit.php" enctype="multipart/form-data">
            <div class="row justify-content-md-center g-2">
                <div class="col"></div>
                <div class="col-2">
                    <input type="file" id="fileUpload" name="fileUpload" multiple>
                    <?php echo $_SESSION['msg'] ?>
                </div>
                <div class="col"></div>
            </div>
        </form>

        <div class="row justify-content-md-center g-2">
            <div class="col"></div>
            <div class="col-md-auto">
                <h3>@<?php echo $_SESSION['userId'] ?></h3>
            </div>
            <div class="col text-start">
                <button type="button" class="btn btn-sm">
                    <span class="glyphicon glyphicon-copy-url" aria-hidden="true" data-url="<?php echo $_SERVER['HTTP_HOST'] ?>/u/<?php echo $_SESSION['userId'] ?>" id="copy-url"><img width="20" height="20" src="https://img.icons8.com/ios/50/clipboard.png" alt="clipboard" /></span>
                </button>
            </div>

            <div class="row justify-content-md-center g-3">
                <div class="col"></div>
                <div class="col-6">
                    <p>
                        <button type="button" class="btn btn-success rounded-pill" data-bs-toggle="collapse" data-bs-target="#collapseAddButton" aria-expanded="false" aria-controls="collapseAddButton">
                            リンクを追加
                        </button>
                    </p>
                    <div class="collapse" id="collapseAddButton">
                        <div class="card card-body">
                            <form method="post" action="../routes/adminEdit.php" name="add">
                                <div class="mb-3">
                                    <lavel for="title" class="form-lavel">
                                        <p class="text-start">タイトル</p>
                                    </lavel>
                                    <input type="text" class="form-control" placeholder="リンク名を入れる" id="title" name="title" required>
                                </div>
                                <div class="mb-3">
                                    <lavel for="url" class="form-lavel">
                                        <p class="text-start">URL</p>
                                    </lavel>
                                    <input type="url" class="form-control" placeholder="https:// または http://で始まるURLを入れる" id="url" name="url" required>
                                </div>
                                <button type="submit" class="btn btn-success rounded-circle p-0" style="width:2rem;height:2rem;" name="+">＋</button>
                                <input type="hidden" name="add" value="addLink">
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col"></div>
            </div>
            <div class="row justify-content-md-center">
                <?php
                // プロフィール画面表示処理
                require_once('../database/connection.php');
                require_once('../database/statement.php');
                require_once('../config/config.php');
                require_once('../config/message.php');

                $userId = $_SESSION['userId'];
                $userMail = $_POST['userMail'];
                $loginFlag = $_POST['login'];
                $logoutFlag = $_POST['logout'];
                $registerFlag = $_POST['register'];

                unset($_SESSION['msg']);


                $dbh = DatabaseConnection::Connection();
                try {
                    $sql = DatabaseStatement::SELECT_USER_ID;
                    $stmt = $dbh->prepare($sql);
                    $stmt->bindValue(':userId', $userId);
                    $stmt->execute();
                    $fetchedUser = $stmt->fetch();

                    $_SESSION['profileImage'] = $fetchedUser['profile_image'];
                } catch (PDOException $e) {
                    $msg = $e->getMessage();
                    $_SESSION['msg'] = $msg;
                    header('Location: ../index');
                }

                try {
                    $sql = DatabaseStatement::SELECT_USER_LINKS;
                    $stmt = $dbh->prepare($sql);
                    $stmt->bindValue(':userId', $userId);
                    $stmt->execute();
                    $fetchedUser = $stmt->fetch();

                    for ($countColumn = 1; $countColumna <= (int)config::MAX_LINK; $countColumn++) {
                        $titleColumn = "title";
                        $urlColumn = "url";
                        $titleColumn = $titleColumn . (string)$countColumn;
                        $urlColumn = $urlColumn . (string)$countColumn;

                        $arrayTitleColumn[$titleColumn <= $fetchedUser[$titleColumn]];
                        $arrayTitleColumn[$urlColumn <= $fetchedUser[$urlColumn]];

                        if (isset($fetchedUser[$titleColumn])) {
                            echo '<div class = "row justify-content-md-center g-2">';
                            echo '<div class="col"></div>';
                            echo '<div class="col-6 d-grid gap-2">';
                            echo '<button type="button" class="btn btn-outline-success btn-lg" data-bs-toggle="collapse" data-bs-target="#collapseLinks';
                            echo $countColumn;
                            echo '" aria-expanded="false" aria-controls="collapseLinks';
                            echo $countColumn;
                            echo '">';
                            echo $fetchedUser[$titleColumn];
                            echo '</button>';
                            echo '<div class = "collapse" id="collapseLinks';
                            echo $countColumn;
                            echo '">';
                            echo '<div class = "card card-body">';
                            echo '<form method="post" action="../routes/adminEdit.php" id="editForm">';
                            echo '<div class="mb-3">';
                            echo '<lavel for="title" class="form-lavel"><p class="text-start">タイトル</p></lavel>';
                            echo '<input type="text" class="form-control" placeholder="リンク名を入れる" id="title" name="title" value="';
                            echo $fetchedUser[$titleColumn];
                            echo '">';
                            echo '</div>';
                            echo '<div class="mb-3">';
                            echo '<lavel for="url" class="form-lavel"><p class="text-start">URL</p></lavel>';
                            echo '<input type="url" class="form-control" id="url" placeholder="https:// または http://で始まるURLを入れる" name="url" value="';
                            echo $fetchedUser[$urlColumn];
                            echo '">';
                            echo '</div>';
                            echo '<div class="row">';
                            echo '<div class="col"></div>';
                            echo '<div class="col-5">';
                            echo '<button type="submit" class="btn btn-success rounded-pill" name="update">リンク更新</button>';
                            echo '';
                            echo '<input type="hidden" name="hiddenLink" value="';
                            echo $countColumn;
                            echo '">';
                            echo '</div>';
                            echo '<div class="col"><button type="submit" class="btn btn-outline-secondary rounded-pill" name="delete">削除</button></div>';
                            echo '</div>';
                            echo '</form>';
                            echo '</div>';
                            echo '</div>';
                            echo '</div>';
                            echo '<div class="col"></div>';
                            echo '</div>';
                        } else {
                            $_SESSION[$countColumn] = (int)$countColumn - 1;

                            $_SESSION[$titleColumn] = $arrayTitleColumn[$titleColumn <= $fetchedUser[$titleColumn]];
                            $_SESSION[$urlColumn] = $arrayTitleColumn[$urlColumn <= $fetchedUser[$urlColumn]];
                            break;
                        }
                    }
                } catch (PDOException $e) {
                    $msg = $e->getMessage();
                    $_SESSION['msg'] = $msg;
                    header('Location: ../index');
                }
                ?>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
</body>

</html>
<script>
    // クリップボードコピー
    $(function() {
        $('#copy-url').click(function() {
            // data-urlの値を取得
            const url = $(this).data('url');

            // クリップボードにコピー
            navigator.clipboard.writeText(url);

            // フラッシュメッセージ表示
            $('.success-msg').fadeIn("slow", function() {
                $(this).delay(2000).fadeOut("slow");
            });
        });
    });
    // ファイルを選択したと同時にPOSTする
    $(function() {
        $("#fileUpload").change(function() {
            $(this).closest("form").submit();
        });
    });
</script>