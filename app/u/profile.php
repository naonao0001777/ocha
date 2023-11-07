<?php session_start(); ?>
<!DOCTYPE html>
<html lang="ja" data-bs-theme="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="stylesheet" href="../resource/css/style.css">
    <link rel="shortcut icon" type="image/x-icon" href="../assets/favicon.ico" />
    <title>Profile</title>
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
        </div>
    </nav>
    <div class="container text-center">
        <?php
        // プロフィール画面表示処理
        require_once('../database/statement.php');
        require_once('../database/connection.php');
        require_once('../config/config.php');
        require_once('../config/session.php');
        require_once('../config/message.php');

        $requestUri = $_SERVER['REQUEST_URI'];
        $startSubInt = strpos($requestUri, 'u/');
        $userId = substr($requestUri, $startSubInt + 2);

        $dbh = DatabaseConnection::Connection();

        try {
            $sql = DatabaseStatement::SELECT_USER_ID;
            $stmt = $dbh->prepare($sql);
            $stmt->bindValue(':userId', $userId);
            $stmt->execute();
            $fetchedUser = $stmt->fetch();

            $profileImage = $fetchedUser['profile_image'];
            $profileImageBlob = $fetchedUser['image_byte'];
            $userName = $fetchedUser['user_name'];
            $biography = $fetchedUser['biography'];
            $youtubeAccount = $fetchedUser['youtube_account'];
            $xAccount = $fetchedUser['x_account'];
            $twitchAccount = $fetchedUser['twitch_account'];
            $githubAccount = $fetchedUser['github_account'];
            $instagramAccount = $fetchedUser['instagram_account'];
            $facebookAccount = $fetchedUser['facebook_account'];

            if ($fetchedUser) {
                // DBのバイナリデータをbase64で出力
                if (isset($profileImageBlob)) {
                    $streamContent = stream_get_contents($profileImageBlob);
                    $base64DecodedContent = base64_encode($streamContent);
                    $fileExtention = substr($profileImage, -3);
                }

                $sql = DatabaseStatement::SELECT_USER_LINKS;
                $stmt = $dbh->prepare($sql);
                $stmt->bindValue(':userId', $userId);
                $stmt->execute();
                $fetchedUser = $stmt->fetch();
                echo '<div class="row justify-content-md-center m-2 p-2">';
                echo '<div class="col-lg-3 col-xs-2"></div>';
                echo '<div class="col-lg-auto col-xs-auto">';
                if (isset($profileImageBlob)) {
                    if ($fileExtention = "png") {
                        echo '<img src="';
                        echo "data:image/png;base64,", $base64DecodedContent;
                        echo '" class="rounded-circle" width="100px" height="100px" alt="">';
                    } else {
                        echo '<img src="';
                        echo "data:image/jpeg;base64,", $base64DecodedContent;
                        echo '" class="rounded-circle" width="100px" height="100px" alt="">';
                    }
                } else {
                    echo '<img src="../assets/default_leaf.png" class=" rounded-circle" width="100px" height="100px" alt="">';
                }
                echo '</div>';
                echo '<div class="col-lg-3 col-xs-2 position-relative"><div class="position-absolute top-50 start-0 translate-middle-y">';
                echo '<button type="button" class="btn btn-dark rounded-circle p-0" data-bs-toggle="tooltip" data-bs-placement="top" title="URLをクリップボードにコピー" style="width:2rem;height:2rem;" id="copy">';
                echo '<span aria-hidden="true" data-url="';
                echo $_SERVER['HTTP_HOST'];
                echo '/u/';
                echo $_SESSION['userId'];
                echo '" id="copy-url">';
                echo '<strong>⁝</strong></span></button>';
                echo '</div></div>';
                echo '</div>';
                echo '<h3 class="mb-2 pb-3 text-center">';
                echo $userName;
                echo '</h3>';
                echo '<p class="fw-bold mb-2 pb-3 text-center">';
                echo $biography;
                echo '</p>';
                echo '<div class="mb-2 pb-3">';
                if (isset($youtubeAccount) && !empty($youtubeAccount)) {
                    echo '<a class="btn btn-sm" type="button" href="';
                    echo $youtubeAccount;
                    echo '" target="_blank" rel="noopener noreferrer">';
                    echo '<img width="35px" height="35px" src="../assets/youtube_icon.png" alt="urllink" />';
                    echo '</a>';
                }
                if (isset($xAccount) && !empty($xAccount)) {
                    echo '<a class="btn btn-sm" type="button" href="';
                    echo $xAccount;
                    echo '" target="_blank" rel="noopener noreferrer">';
                    echo '<img width="35px" height="35px" src="../assets/icon_x.png" alt="urllink" />';
                    echo '</a>';
                }
                if (isset($twitchAccount) && !empty($twitchAccount)) {
                    echo '<a class="btn btn-sm" type="button" href="';
                    echo $twitchAccount;
                    echo '" target="_blank" rel="noopener noreferrer">';
                    echo '<img width="35px" height="35px" src="../assets/twitch_icon.png" alt="urllink" />';
                    echo '</a>';
                }
                if (isset($githubAccount) && !empty($githubAccount)) {
                    echo '<a class="btn btn-sm" type="button" href="';
                    echo $githubAccount;
                    echo '" target="_blank" rel="noopener noreferrer">';
                    echo '<img width="35px" height="35px" src="../assets/github_icon.png" alt="urllink" />';
                    echo '</a>';
                }
                if (isset($instagramAccount) && !empty($instagramAccount)) {
                    echo '<a class="btn btn-sm" type="button" href="';
                    echo $instagramAccount;
                    echo '" target="_blank" rel="noopener noreferrer">';
                    echo '<img width="35px" height="35px" src="../assets/instagram_icon.png" alt="urllink" />';
                    echo '</a>';
                }
                if (isset($facebookAccount) && !empty($facebookAccount)) {
                    echo '<a class="btn btn-sm" type="button" href="';
                    echo $facebookAccount;
                    echo '" target="_blank" rel="noopener noreferrer">';
                    echo '<img width="35px" height="35px" src="../assets/facebook_icon.png" alt="urllink" />';
                    echo '</a>';
                }
                echo '</div>';
                for ($countColumn = 1; $countColumna <= (int)config::MAX_LINK; $countColumn++) {
                    $titleColumn = "title";
                    $urlColumn = "url";
                    $titleColumn = $titleColumn . (string)$countColumn;
                    $urlColumn = $urlColumn . (string)$countColumn;

                    $arrayTitleColumn[$titleColumn <= $fetchedUser[$titleColumn]];
                    $arrayTitleColumn[$urlColumn <= $fetchedUser[$urlColumn]];

                    if (isset($fetchedUser[$titleColumn])) {
                        echo '<div class = "row mb-3">';
                        echo '<div class="col-lg-3 col-sm-2"></div>';
                        echo '<div class="col-lg-6 col-sm-8 d-grid gap-2">';
                        echo '<a href="';
                        echo $fetchedUser[$urlColumn];
                        echo '" class="';
                        echo 'btn btn-outline-success text-success-emphasis btn-lg rounded-pill" target="_blank" rel="noopener noreferrer" style="--bs-btn-padding-y: .70rem; --bs-btn-padding-x: .5rem;">';
                        echo $fetchedUser[$titleColumn];
                        echo '</a>';
                        echo '</div>';
                        echo '<div class="col-lg-3 col-sm-2"></div>';
                        echo '</div>';
                    } else {
                        $_SESSION[$countColumn] = (int)$countColumn - 1;

                        $_SESSION[$titleColumn] = $arrayTitleColumn[$titleColumn <= $fetchedUser[$titleColumn]];
                        $_SESSION[$urlColumn] = $arrayTitleColumn[$urlColumn <= $fetchedUser[$urlColumn]];
                        break;
                    }
                }
            } else {
                header("HTTP/1.1 404 Not Found");
                exit;
            }
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            $_SESSION['msg'] = $msg;
            header('Location: ../index');
        }
        ?>
    </div>
</body>

</html>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<script>
    // ツールチップ
    $(function() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    });

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
</script>