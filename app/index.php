<?php
session_start();
?>
<!DOCTYPE html>
<html lang="ja" data-bs-theme="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- OGP設定 -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Ocha" />
    <meta property="og:description" content="Ochaはリンクを貼るプロフィールWebサービスです" />
    <meta property="og:url" content="https://ocha.onrender.com/" />
    <meta property="og:site_name" content="Ocha" />
    <meta property="og:image" content="https://user-images.githubusercontent.com/46675984/269119261-5a61b35d-27d1-4a8b-99cf-dbbdd2bfd279.png" />
    <!-- Twitterカードの設定 -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@salty_special" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="shortcut icon" type="image/x-icon" href="./assets/favicon.ico" />
    <title>ocha</title>
</head>

<body>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" href="./index">Ocha<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <style>
                        svg {
                            fill: #b2f202
                        }
                    </style>
                    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                </svg></a>
            <div class="d-flex ms-auto">
                <form method="post" action="./view/login">
                    <div class="">
                        <button type="submit" class="btn btn-outline-secondary btn-sm mx-1" id="login" name="fromOhterToLogin">Sign in</button>
                        <input type="hidden" id="login" name="hiddenPage" value="index">
                    </div>
                </form>
                <form method="post" action="./view/register">
                    <div class="">
                        <button type="submit" class="btn btn-success btn-sm mx-1" id="register" name="register">Sign up</button>
                    </div>
                </form>
            </div>
        </div>
    </nav>
    <main>
        <div class="text-center bg-body-tertiary p-3 p-sm-5 mb-4 rounded">
            <h1>Ocha<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <style>
                        svg {
                            fill: #b2f202
                        }
                    </style>
                    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                </svg></h1>
            <?php
            if (isset($_SESSION['msg'])) {
                echo $_SESSION['msg'];
            }
            ?>
            <p class="lead">Ochaはリンクをまとめてプロフィールに追加することができるプロフィールサービスです</p>
            <a class="btn btn-success btn-md" href="./view/register" role="button">はじめる</a>
        </div>
        <div class="row my-5 mx-0 px-3 px-md-0">
            <div class="col-lg-3"></div>
            <div class="col-lg-6">
                <h4>最大10個まで</h4>
                <p>リンクを追加することができるのは最大10個までです。</p>
                <h4 class="mt-4">プロフィール画像を追加できます</h4>
                <p>png,jpeg形式の画像をプロフィール画像として使用できます。もちろん使用しなくてもデフォルトのアイコンが当てられます。</p>
                <h4 class="mt-4">アカウントを作成します</h4>
                <p>アカウントを作成していただきますが、もちろん削除してもう一度再利用することができます。</p>
            </div>
            <div class="col-lg-3"></div>
        </div>
        <div class="row my-5 mx-0 px-3 px-md-0">
            <div class="col-lg-4 col-xs-2"></div>
            <div class="col-lg-4 col-xs-8 text-center">
                <!-- <img src="./assets/data.png" style="width:20px;height:20px;" alt=""> -->
                <a class="" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">

                    データの取扱いについて
                </a>
                <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="offcanvasExampleLabel">データの取扱いについて</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <div>
                            <p class="text-start">
                            <ul>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    このサイトは<a href="https://render.com/" target="_blank">Render</a>によってDDos攻撃などからのセキュリティを保障されています。</br>
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    このサイトに登録をされたことによって得たデータは、全てRenderに建てているデータベースに保管され、このサイトに使用される目的でのみ情報を取扱います。</br>
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    また、アカウントを作成する際に入力するメールアドレスは適当なもので大丈夫です。</br>
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    例えば、"a@example.com"など本来使用しているメールアドレスでなくともメール認証機能を実装していないため、
                                    他のユーザーとの被りがない限り本サイトを使用することができます。</br>
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    また、アカウントを削除することで、ご登録いただいたメールアドレス、ID、パスワードはデータベースから削除されます。
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    当サイトはRenderにホストされていますが、無料枠での利用のため、15分間操作がない場合、サーバーの再起動が必要になります。
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    サーバーは再起動に最大30秒ほど要します。
                                </li>
                                <li class="text-start" style="padding:2px;margin:2px;">
                                    また、データベース内に保管されたデータは3ヶ月後に全て消去されます。その際には再度ご登録いただく形になります。如何せん商用に使っていない個人開発ですので、その点ご了承ください。
                                </li>
                            </ul>
                            </p>
                        </div>
                        <div class="row">
                            <div class="col-2"></div>
                            <div class="col-8">
                                <p>当サイト制作者の情報</p>
                            </div>
                            <div class="col-2"></div>
                        </div>
                        <div class="row">
                            <div class="col-4"></div>
                            <div class="col-2">
                                <a class="contact-link" href="https://twitter.com/salty_special" target="_blank" rel="noopener noreferrer nofollow"><img src="./assets/icon_x.png" style="width:30px;" alt=""></a>
                            </div>
                            <div class="col-2">
                                <a class="contact-link" href="https://github.com/naonao0001777" target="_blank" rel="noopener noreferrer nofollow"><img src="./assets/icon_gh.png" style="width:30px;" alt=""></a>
                            </div>
                            <div class="col-4"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-xs-2"></div>
        </div>
    </main>
</body>

</html>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<script src="./resource/js/jquery.cookie.js"></script>
<?php session_destroy(); ?>
<script>
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
    });

    $(function() {
        $.removeCookie('clicked');
    });
</script>