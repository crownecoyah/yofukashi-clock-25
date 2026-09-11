# 夜ふかし時計25時

午前0時を過ぎても、今日の続き。macOS 14以降で使える、25時記法の時計・予定管理アプリです。

**[配布サイト](https://crownecoyah.github.io/yofukashi-clock-25/) · [v1.0.0 ダウンロード](https://github.com/crownecoyah/yofukashi-clock-25/releases/tag/v1.0.0)**

一日の境界を午前5時にすると、9月11日の午前1時25分を「9月10日 25:25」と表示します。アナログ時計は実際の時刻を表示します。

## 機能

- アナログ時計と25時記法のデジタル時計
- 一日の境界を0〜12時から指定（初期値5時）
- 秒表示、デジタル時計のフォント・サイズ変更
- 25時・26時などを使う予定入力と、予定の作成・編集・削除
- macOS Calendarへの登録前に、実際の日時を確認
- 最前面表示、すべてのデスクトップへの表示、フルスクリーン上への表示
- ウィンドウ位置・サイズの保存、ログイン時の起動

## ダウンロードと動作環境

- macOS 14以降。配布アプリはApple Silicon / Intel両対応のUniversalビルドです。
- Releaseの `yofukashi-clock-25-v1.0.0-macOS.zip` を展開すると、アプリ・利用説明・ライセンスが入っています。
- ソースのみのZIPは `yofukashi-clock-25-v1.0.0-source.zip` です。
- `SHA256SUMS.txt` でダウンロードしたZIPの整合性を確認できます。

**v1.0.0はアドホック署名で、Developer ID署名・Appleの公証は行っていません。** macOSが起動を制限する場合があります。署名済み・公証済みアプリとしての配布ではありません。ソースからXcodeでビルドすることもできます。

## プライバシー

アプリの予定はMac内のApplication SupportにJSONで、設定はUserDefaultsに保存します。本アプリ独自のサーバーや分析サービスへ送信する機能はありません。Calendarへの登録にはアクセス許可が必要で、登録後の同期は選択したCalendarアカウントの設定に従います。

アプリ内の予定を削除しても、Calendarへ登録した予定は連動して削除されません。重要な予定はCalendar側でも日時と保存先をご確認ください。

## ソースからビルド

Xcodeで `macOS/NightOwlClock25/NightOwlClock25.xcodeproj` を開き、実行先に「My Mac」を選択します。必要に応じてSigning & Capabilitiesで自身のTeamとBundle Identifierを設定してください。共有ソースに個人のTeam IDは含めていません。

```sh
xcodebuild build -project macOS/NightOwlClock25/NightOwlClock25.xcodeproj -scheme NightOwlClock25 -configuration Debug
xcodebuild test -project macOS/NightOwlClock25/NightOwlClock25.xcodeproj -scheme NightOwlClock25 -configuration Debug
```

配布用UniversalビルドとZIPの作成:

```sh
python3 scripts/build-release.py
```

出力先はGit対象外の `release/v1.0.0/` です。ビルド時のローカルパスを置換し、署名・ZIP・秘密情報パターンを検査します。Developer ID署名や公証を自動で行う処理はありません。

## 配布サイトの開発

Node.js 24 LTS推奨。既存のvinext / React / Vite構成を使用しています。

```sh
npm ci
npm run dev
npm run build:pages
npm test
```

`app/` がサイトの編集元、`docs/` がGitHub Pagesへ配信する静的出力です。配信ページはJavaScript・ログイン・データベース不要で閲覧できます。変更後は `npm run build:pages` で `docs/` を再生成してください。GitHub Pagesは `main` ブランチの `/docs` を配信します。

## リポジトリ構成

| 場所 | 内容 |
| --- | --- |
| `macOS/NightOwlClock25/` | アプリ、Xcodeプロジェクト、テスト、利用説明 |
| `app/`、`public/` | 配布サイトのソースと画像 |
| `docs/` | GitHub Pages用の静的ファイル |
| `scripts/` | 配布ビルド・静的書き出し・公開対象検査 |
| `PUBLICATION.md` | 公開対象・除外方針・検証記録 |

## 制作・参考・ライセンス

着想・仕様の方向性・最終判断: 黒猫屋倫彦。コード、UI、文書、アイコンの大部分は、同氏の指示と確認のもとChatGPTおよびCodexを使って生成・編集されています。

safetypin氏のWindows用ソフトウェア「TimerA」の25時記法から着想を得ています。TimerAのコードやプログラム本体は使用していません。詳細は[利用説明](macOS/NightOwlClock25/README.txt)をご覧ください。

Copyright (c) 2026 黒猫屋倫彦。独自のソース・文書・画像は[MIT License](LICENSE.txt)で提供します。第三者のライブラリ等にはそれぞれのライセンスが適用されます。OpenAIは本ソフトウェアの配布者・保守責任者ではありません。
