<?php

class DatabaseStatement
{
    const SELECT_USER_ID = 'SELECT * FROM users WHERE user_id = :userId;';
    const SELECT_USER_ID_MAIL = 'SELECT * FROM users WHERE mail = :userMail OR user_id = :userId;';
    const SELECT_USER_AUTO = 'SELECT * FROM users WHERE auto_login_token= :autoLoginToken AND auto_login = TRUE;';
    const INSERT_USER_USERS = 'INSERT INTO users (user_id, password, mail, user_name) VALUES (:userId, :userPassword, :userMail, :userName);';
    const DELETE_USER = 'DELETE FROM users WHERE user_id = :userId;';
    const DELETE_USER_LINK = 'DELETE FROM links WHERE user_id = :userId;';
    const SELECT_USER_LINKS = 'SELECT * FROM links WHERE user_id = :userId;';
    const INSERT_USER_LINKS = 'INSERT INTO links (user_id) VALUES (:userId);';
    const UPDATE_LINKS = '';
    const SELECT_FILE_USERS = 'SELECT * FROM users WHERE user_id = :userId;';
    const UPDATE_FILE_USERS = 'UPDATE users SET profile_image = :uploadedFileName, image_byte = :imageByte WHERE user_id = :userId;';
    const UPDATE_NAME_USERS = 'UPDATE users SET user_name = :userName WHERE user_id = :userId;';
    const UPDATE_BIO_USERS = 'UPDATE users SET biography = :updateBiography WHERE user_id = :userId;';
    const UPDATE_AUTO_USERS = 'UPDATE users SET auto_login = :autoLoginCheck, auto_login_token = :autoLoginToken WHERE user_id = :userId;';
    const UPDATE_YOUTUBE_USERS = 'UPDATE users SET youtube_account = :updateYoutube WHERE user_id = :userId;';
    const UPDATE_X_USERS = 'UPDATE users SET x_account = :updateX WHERE user_id = :userId;';
    const UPDATE_TWITCH_USERS = 'UPDATE users SET twitch_account = :updateTwitch WHERE user_id = :userId;';
    const UPDATE_GITHUB_USERS = 'UPDATE users SET github_account = :updateGithub WHERE user_id = :userId;';
    const UPDATE_INSTAGRAM_USERS = 'UPDATE users SET instagram_account = :updateInstagram WHERE user_id = :userId;';
    const UPDATE_FACEBOOK_USERS = 'UPDATE users SET facebook_account = :updateFacebook WHERE user_id = :userId;';
}
