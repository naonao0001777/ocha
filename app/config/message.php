<?php
class message
{
    const LOGINED = 'ログインしました。（Login successed.）';
    const LOGOUT = 'ログアウトしました。';
    const REGISTERD = 'アカウントの登録が完了しました。';
    const DELETED = 'アカウントの削除が完了しました。';
    const CANT_LOGIN = '※ログインできませんでした';
    const MAIL_IS_USED = '※そのメールアドレスは既に使われています。';
    const USER_ID_IS_USED = '※そのユーザーIDは既に使われています。';
    const UNMATCH_USER_PASSWORD = '※ユーザーIDかパスワードが一致しません。';
    const ADD_LINK = 'リンクを追加しました。';
    const UPDATE_LINK = 'リンクを更新しました。';
    const DELETE_LINK = 'リンクを削除しました。';
    const CANT_ADD_LINK = 'これ以上リンクを追加できません。';
    const LOGGED_IN_GUEST = 'ゲストとしてログインしました。 （ You Logged in as a guest. ）';
    const LOGGED_IN_GUEST_ERROR = 'ゲストとしてログイン中にエラーが発生しました。管理者にお問い合わせください。 （ Login error. ）';
    const UPDATED_USER_NAME = 'ユーザー名が更新されました。（ Your name was changed. Check it on Admin page or Profile page. ）';
}
