<?php session_start();
if (!isset($_SESSION['token'])) {
    header('Location: ./login');
    exit;
} ?>

<!DOCTYPE html>
<html lang="ja" data-bs-theme="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="stylesheet" href="../resource/css/style.css">
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
    <main>
        <div class="container-sm text-center">
            <div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert" hidden>
                現在、画像ファイルをアップロードしてもサーバー再起動時に表示されなくなる不具合に対応しています。
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="dismissAlert"></button>
            </div>
            <div class="row justify-content-center g-2">
                <div class="col-lg-4 col-xs-3"></div>
                <div class="col-lg-4 col-xs-6">
                    <?php
                    require_once('../database/connection.php');
                    require_once('../database/statement.php');
                    require_once('../config/config.php');
                    require_once('../config/message.php');

                    try {
                        $dbh = DatabaseConnection::Connection();

                        $userId = $_SESSION['userId'];

                        $sql = DatabaseStatement::SELECT_USER_ID;
                        $stmt = $dbh->prepare($sql);
                        $stmt->bindValue(':userId', $userId);
                        $stmt->execute();
                        $fetchedUser = $stmt->fetch();

                        // DBのバイナリデータをbase64で出力
                        $profileImage = $fetchedUser['profile_image'];
                        $profileImageBlob = $fetchedUser['image_byte'];

                        if (isset($profileImageBlob)) {
                            $streamContent = stream_get_contents($profileImageBlob);
                            $base64DecodedContent = base64_encode($streamContent);

                            $fileExtention = substr($profileImage, -3);
                            if ($fileExtention = "png") {
                                echo '<img src="';
                                echo "data:image/png;base64,", $base64DecodedContent;
                                echo '" class="img-thumbnail rounded-circle" width="100px" height="100px" alt="">';
                            } else {
                                echo '<img src="';
                                echo "data:image/jpeg;base64,", $base64DecodedContent;
                                echo '" class="img-thumbnail rounded-circle" width="100px" height="100px" alt="">';
                            }
                        } else {
                            echo "<img src='../assets/default_leaf.png' class='img-thumbnail rounded-circle' width='100px' height='100px' alt=''>";
                        }
                    } catch (PDOException $e) {
                        $msg = $e->getMessage();
                        $_SESSION['msg'] = $msg;
                        header('Location: ../index');
                    } ?>
                </div>
                <div class="col-lg-4 col-xs-3"></div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-3 col-md-3 col-0"></div>
                <div class="col-lg-auto col-md-auto col-auto">
                    <form method="post" action="../routes/adminEdit.php" enctype="multipart/form-data">
                        <input type="file" class="form-control-sm" id="fileUpload" name="fileUpload" multiple>
                    </form>
                </div>
                <div class="col-lg-3 col-md-3 col-1 text-start">
                    <form method="post" action="../routes/adminEdit.php">
                        <button type="submit" class="btn btn-sm" id="fileDelete" name="fileDelete" value="fileDelete" data-bs-toggle="tooltip" data-bs-placement="top" title="アイコンを消去">
                            <span class="glyphicon glyphicon-copy-url" aria-hidden="true" id="fileDelete"><img width="20" height="20" src="../assets/trash.png" alt="" /></span>
                        </button>
                    </form>
                </div>

            </div>
            <div class="row justify-content-center g-2">
                <div class="col-lg-4 col-xs-0"></div>
                <div class="col-lg-auto col-xs-auto">
                    <?php echo $_SESSION['msg'] ?>
                </div>
                <div class="col-lg-4 col-xs-0"></div>
            </div>

            <div class="row justify-content-center mt-2 p-1">
                <div class="col-lg-4 col-2"></div>
                <div class="col-lg-auto col-auto text-center">
                    <h3>@<?php echo $userId ?></h3>
                </div>
                <div class="col-lg-4 col-2 text-start">
                    <button type="button" class="btn btn-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="URLをクリップボードにコピー">
                        <span class="glyphicon glyphicon-copy-url" aria-hidden="true" data-url="<?php echo $_SERVER['HTTP_HOST'] ?>/u/<?php echo $_SESSION['userId'] ?>" id="copy-url"><img width="20" height="20" src="../assets/clipboard.png" alt="clipboard" /></span>
                    </button>
                </div>
            </div>
            <div class="col-lg-4 col-2 text-start">
            </div>
            <div class="row justify-content-center mt-2 p-1">
                <div class="col-lg-3 col-xs-3"></div>
                <div class="col-lg-6 col-xs-6 gap-2">
                    <button type="button" class="btn btn-success rounded-pill mb-2" data-bs-toggle="collapse" data-bs-target="#collapseAddButton" aria-expanded="false" aria-controls="collapseAddButton">
                        リンクを追加
                    </button>
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
                <div class="col-lg-3 col-xs-3"></div>
            </div>
            <div class="row justify-content-center">
                <?php
                // プロフィール画面表示処理
                unset($_SESSION['msg']);

                $_SESSION['count'] = $count++;

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
                            echo '<div class = "row justify-content-center mb-3">';
                            echo '<div class="col-lg-3 col-xs-2"></div>';
                            echo '<div class="col-lg-6 col-xs-8 d-grid gap-2">';
                            echo '<button type="button" class="btn btn-outline-success text-success-emphasis btn-lg rounded-pill" style="--bs-btn-padding-y: .70rem; --bs-btn-padding-x: .5rem;" data-bs-toggle="collapse" data-bs-target="#collapseLinks';
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
                            echo '<div class="col-lg-3 col-xs-2"></div>';
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
    </main>

</body>

</html>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<script src="../resource/js/jquery.cookie.js"></script>
<script>
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    // クリップボードコピー
    $(function() {
        $('#copy-url').on('click', function() {
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

    $(function() {
        if ($.cookie('clicked') == undefined) {
            document.getElementById("alert").hidden = false;
        }
    });

    $(function() {
        $('#dismissAlert').on('click', function() {
            $.cookie('clicked', 'on', {
                expires: 1,
                path: '/'
            });
        });
        $('#hoge').show();
    });

    // $(function() {
    //     if ($.cookie('dismissed') == undefined) {
    //         $('.container-sm .text-center').append('< div class = "alert alert-warning alert-dismissible fade show" role="alert" id= "alert" > 現在は画像をアップロードできません。 あらかじめご了承ください。 <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="dismissAlert"></button></div>');
    //     }
    // });
</script>