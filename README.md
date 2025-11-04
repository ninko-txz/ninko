# 忍狐

[ninko.neocities.org](https://ninko.neocities.org) で公開中の個人サイトです。

## 開発環境

```
# インストール
$ git clone https://github.com/ninko-txz/ninko.git
$ cd ninko
$ npm install

# 開発用サーバー起動
$ npm run serve

# 動作確認
http://localhost:8080
```

## Neocities との同期

```
# 環境構築
$ pip install -r requirements.txt
$ export NEOCITIES_API_KEY=xxxxxxxxxx

# 同期状態確認
$ npm run status

# 同期
$ npm run push
```

## 備考

-   画像ファイル(/img 以下)はリポジトリに含まれていません。
-   neocities 側に空のディレクトリが残ることがあります。(NeocitiesAPI の仕様上ディレクトリに対する削除操作が出来ないため)
