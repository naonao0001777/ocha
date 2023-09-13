<?php

class DatabaseStatement{
    const SELECT_USER_ID = 'SELECT * FROM users WHERE user_id = :userId;';
    const SELECT_USER_ID_MAIL = 'SELECT * FROM users WHERE mail = :userMail OR user_id = :userId;';
    const INSERT_USER_USERS = 'INSERT INTO users (user_id, password, mail) VALUES (:userId, :userPassword, :userMail);';
    const DELETE_USER = 'DELETE FROM users WHERE user_id = :userId;';
    const DELETE_USER_LINK = 'DELETE FROM links WHERE user_id = :userId;';
    const SELECT_USER_LINKS = 'SELECT * FROM links WHERE user_id = :userId;';
    const INSERT_USER_LINKS = 'INSERT INTO links (user_id) VALUES (:userId);';
    const UPDATE_LINKS = '';
    const SELECT_FILE_USERS = 'SELECT * FROM users WHERE user_id = :userId;';
    const UPDATE_FILE_USERS = 'UPDATE users SET profile_image = :uploadedFileName WHERE user_id = :userId;';
}