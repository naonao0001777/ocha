<?php
class message
{
    const LOGINED = 'ログインしました。（Login successed.）';
    const LOGOUT = 'ログアウトしました。（Logout.）';
    const REGISTERD = 'アカウントの登録が完了しました。';
    const DELETED = 'アカウントの削除が完了しました。';
    const CANT_LOGIN = '※ログインできませんでした';
    const MAIL_IS_USED = '※そのメールアドレスは既に使われています。';
    const USER_ID_IS_USED = '※そのユーザーIDは既に使われています。';
    const UNMATCH_USER_PASSWORD = '※ユーザーIDかパスワードが一致しません。';
    const ADD_LINK = 'リンクを追加しました。（Added your link.）';
    const UPDATE_LINK = 'リンクを更新しました。（Updated your link.）';
    const DELETE_LINK = 'リンクを削除しました。（Deleted your link.）';
    const CANT_ADD_LINK = 'これ以上リンクを追加できません。';
    const UPDATE_IMAGE = 'プロフィール画像を更新しました。';
    const DELETE_IMAGE = 'プロフィール画像を削除しました。';
    const UPDATE_IMAGE_ERROR = 'プロフィール画像のアップロードに失敗しました。';
    const CHANGE_IMAGE_EXT = 'ファイルの拡張子をjpegかpngにしてください。';
    const LOGGED_IN_GUEST = 'ゲストとしてログインしました。 （ You Logged in as a guest. ）';
    const LOGGED_IN_GUEST_ERROR = 'ゲストとしてログイン中にエラーが発生しました。管理者にお問い合わせください。 （ Login error. ）';
    const UPDATED_USER_NAME = 'ユーザー名が更新されました。（ Your name was changed. Check it on Admin page or Profile page. ）';
    const UPDATED_BIO = '略歴・ひとことが更新されました。（ Your bio was updated. Check it on Admin page or Profile page. ）';
    const UPDATED_SNS = 'SNSアカウントが更新されました。（ Your SNS Account was updated. ）';
}
