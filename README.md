# 年賀状がわりのサイト

- 30秒くらいで遊べるおみくじ要素のあるホームページを作る
- 気が向いた年に作成する
- 最新のものは[https://newyear-nengajo.web.app/](https://newyear-nengajo.web.app/) にデプロイされているはず



## 年末の自分へ

```
# dev用の期間限定で立ち上げ
firebase hosting:channel:deploy dev --expires 1d
# dev用の環境を更新
firebase hosting:channel:deploy dev
# 本番のデプロイはmasterブランチへのマージでできる
```
