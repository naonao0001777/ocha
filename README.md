# ocha
## 再構築マニュアル
### Dockerイメージを作成する
`docker image build . -t abinao/ocha`
`docker compose up`
### Postgresを構築する
RenderでPostgresを再構築する
ホスト情報、データベース名、ユーザー名、パスワードを管理する
External Connectionを使い、psqlで接続をする。
### Configファイルを構築したDBの接続情報に書き換える
External Connectionのコマンドをconfigファイルの古い情報を上書き
### Dockerを立ち上げる
`docker compose up`でコンテナイメージが立ち上がり、コンテナも作られる
### DockerをDockerHubにpushする
`docker push abinao/ocha`でpush
アカウント名/アプリ名で作ることが必須
### RenderにDockerfileを上げる
Manual DeployでDockerhubからpushする方法があるため、push
