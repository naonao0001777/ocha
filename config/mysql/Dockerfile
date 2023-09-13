#使うDockerイメージ
FROM mysql:8.0

#ポートの設定
EXPOSE 4306:3306

#MySQL設定ファイルをコピー
COPY ./mycnf /etc/mysql/conf.d/my.cnf

#MySQL初期実行SQL
COPY init_mysql.sql /docker-entrypoint-initdb.d/init_mysql.sql

#MySQL環境変数
ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=ocha
ENV MYSQL_USER=ochauser
ENV MYSQL_PASSWORD=ochapassword

#docker run時の実行コマンド
CMD ["mysqld"]