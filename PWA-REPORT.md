# PWA版 実装・検証報告

検証日: 2026-09-16。公開対象: https://crownecoyah.github.io/yofukashi-clock-25/pwa/

## 調査と配置

作業開始時のPWAフォルダは空で、親の作業リポジトリは多数の既存ファイルが削除状態でした。隣接するMac / Winのソース・README・LICENSE・画像、公開リポジトリとGitHub Pagesの設定を読み取り確認しました。親の変更を上書きせず、PWA作業フォルダ内の `site/` に最新のGitHubリポジトリを複製して実装しています。

既存紹介サイトの編集元はReact / vinext、公開物は静的HTML/CSS。公開元は `main` ブランチ `/docs`。PWAはフレームワークを追加せず独立したHTML/CSS/JavaScriptで実装し、`public/pwa/` を編集元、`docs/pwa/` を公開物としました。既存Sites設定やPages設定は変更していません。依頼に従い公開先は既存GitHub Pagesです。

Mac / Windowsの日時変換・入力範囲（境界0〜12時、予定0〜35時）を確認しました。午前5時未満を前日、5時ちょうどを当日とする仕様を継承。アナログ時計は通常時刻、予定の所属日・曜日・表示は生活日付です。DST重複時刻についてはMacが先の時刻、Windowsが後の時刻を選ぶ差があるため、PWAでは先を初期値として双方を選べます。

## 新規ファイル

以下のPWAファイルを `public/pwa/` と `docs/pwa/` に配置しています。

| ファイル | 役割 |
| --- | --- |
| `index.html` | 時計、予定、設定、編集・削除ダイアログ、利用案内 |
| `style.css` | 既存の濃紺・黄色を継承したレスポンシブUI |
| `app.js` | 時計更新、予定操作、入力確認、設定、インストール案内 |
| `datetime.js` | UIから独立した生活日時・実日時変換 |
| `ics.js` | iCalendar生成、共有、ダウンロード |
| `storage.js` | IndexedDBの予定、localStorageの設定 |
| `manifest.webmanifest` | アプリ名、相対start_url/scope、standalone、色、アイコン |
| `service-worker.js` | PWA内限定・バージョン付きアプリ資産キャッシュ |
| `icons/icon-192.png`, `icons/icon-512.png` | 通常アイコン |
| `icons/maskable-512.png` | 余白付きmaskableアイコン |
| `icons/apple-touch-icon.png` | Apple端末用180pxアイコン |
| `LICENSE.txt` | 既存Mac版MIT本文をそのままコピー |
| `README.md` | 概要、使い方、保存・ICS・公開・制限・由来・ライセンス |

その他の新規ファイル:

- `scripts/export-pwa.mjs`: 公開物のコピー。
- `scripts/serve-pwa.mjs`: 本番と同じサブディレクトリでのローカルサーバー。
- `scripts/test-pwa.mjs`: 3タイムゾーンの自動テスト。
- `tests/pwa/datetime.test.mjs`, `ics.test.mjs`, `structure.test.mjs`: 変換・ICS・構成・既存ページ保護のテスト。
- `tests/pwa/browser-check.mjs`: ChromeによるUI・オフライン・保持・PWA検査。
- `tests/pwa/storage-check.mjs`: IndexedDB・設定・競合・保存失敗のテスト。
- `PWA-REPORT.md`: 本報告。

## 既存ファイルの変更

| ファイル | 変更内容 |
| --- | --- |
| `app/page.tsx`, `docs/index.html` | 既存の版切り替え部分にPWAリンクを1つ追加 |
| `public/windows.html`, `docs/windows.html` | 同じPWAリンクを1つ追加 |
| `scripts/export-pages.mjs` | 通常の公開ビルドの最後にPWA出力を追加 |
| `package.json` | `dev:pwa`, `build:pwa`, `test:pwa` のスクリプトのみ追加 |
| `README.md` | PWAへの導線と専用README・報告へのリンクを追加 |

既存のダウンロードURL、スクリーンショット、説明文、CSS、ネイティブソース、既存LICENSEは変更していません。ライブラリ依存やlockfileの変更もありません。紹介HTMLは追加したPWAリンクを除くと作業開始時のSHA-256と一致することを自動検証しています。親作業リポジトリやMac / Win作業コピーは未変更です。

## PWA構成・アイコン・保存

- manifest: `docs/pwa/manifest.webmanifest`
- SW: `docs/pwa/service-worker.js`
- SW scope: `https://crownecoyah.github.io/yofukashi-clock-25/pwa/`
- manifest id/start_url/scope: `./`、display: `standalone`
- theme/background: `#090e1a`
- 元画像: 既存の `docs/images/app-icon.png`。画像を目視して「25」のブランドアイコンを確認。通常192/512、Apple180に縮小。maskableは512四方に元画像を348四方で中央配置し、外周に濃紺の余白を付与。
- 設定: localStorage `yofukashi-pwa-settings-v1`。
- 予定: IndexedDB `yofukashi-clock-25-pwa`、version 1、`events` object store。
- 予定フィールド: UUID `id`、`title`、UTC ISO `start`/`end`、`note`、UTC ISO `createdAt`/`updatedAt`、保存時のIANA `timeZone`。
- 予定の実日時を正とし、境界・端末タイムゾーンから生活日付を再計算。設定変更で実日時は変わりません。
- 保存はトランザクション。更新日時の照合により別タブの変更を検出。保存エラー時には入力を残し日本語の案内を表示。

## ICS・タイムゾーン

独立した `datetime.js` で25時記法を端末のローカル実日時へ変換し、UTC ISOで保持します。ICSはその実日時を `DTSTART:...Z` / `DTEND:...Z` に書き出します。固定UTC+9は使いません。UTC表現により共有先にも同じ瞬間を渡せ、地域ごとのVTIMEZONE定義を同梱する必要を避けています。生活日付を日数ミリ秒で加減しないため、DST切替でも不用意に1時間ずらしません。存在しない現地時刻は拒否し、重複時刻は前後を選択できます。

[RFC 5545](https://www.rfc-editor.org/rfc/rfc5545)のiCalendar形式に基づき、必須フィールド、日本語UTF-8、CRLF、TEXTエスケープ、75オクテット以下の行折り返し、安定したUUID由来UID、生成時DTSTAMPを実装。時刻付き予定のみです。

「カレンダーに追加」は可能ならWeb Share APIでファイル共有、それ以外や共有エラーはダウンロードへ切り替えます。キャンセル時は終了します。「ICSを保存」は常にダウンロード。全予定を1ファイルにまとめるICS保存も実装しました。自動登録・自動同期とは案内していません。

## キャッシュ

SWバージョン `v1.0.0`。scopeを含む固有キャッシュ名を使用。HTML/CSS/JS/manifest/アイコン/ライセンスを初回に一括キャッシュし、以後はそのキャッシュを使用。フォントはOS標準で、CDN・外部フォント不要です。更新は既存PWAをすべて閉じてから反映。activate時に同じscopeの旧キャッシュだけ削除し、IndexedDB/localStorageや他ページのキャッシュは削除しません。Mac / WindowsページはSW制御外です。

## 実装した機能

生活日付・曜日、25時記法、境界0〜12時、アナログ時計、デジタル時計、秒ON/OFF、フォント3種、文字サイズ2種、予定追加・編集・削除、開始と終了の生活日付、25時入力、タイトル・メモ、入力エラー案内、実日時プレビュー、予定フィルター、端末内保存、予定ごとおよび全予定のICS、Web Shareとダウンロード、レスポンシブ、基本的なキーボード操作とフォーカス、インストール案内、オフライン動作、ネイティブ紹介ページへの相互導線。

## 未実装・主なネイティブ版との差

Google Calendar API、EventKit、OAuth、認証、ユーザーアカウント、クラウド同期、端末間同期、常に最前面、Spaces、ログイン時起動、ネイティブウィンドウ復元は実装していません。Mac版の直接カレンダー登録の代わりにICSを使用。Windows版にはないICS書き出しをPWAでは提供します。フォントはOS標準の3系統で、任意フォント一覧はありません。通知・アラーム、繰り返し・終日予定、JSONバックアップ復元・ICSインポートは対象外です。

## 実施したテスト

- `npm run test:pwa`: 東京19、ニューヨーク22、ロードハウ島20、合計61件通過。
- 指定された2027/01/01 25:00・28:00、月末、年末、うるう年、境界1分前とちょうど、境界変更、日またぎ、前後関係、不正入力を確認。
- DST存在しない時刻、重複時刻、30分のDST、実日時↔生活日時の往復。
- ICS必須項目、通常UTC日時、日本語、特殊文字、CRLF、UTF-8と75オクテット折り返し、UID、一括出力、共有成功／非対応／失敗／キャンセルの分岐。
- `npm test`: 既存紹介サイトの5件通過。リンク先資産の存在、公開URL、ダウンロードURLを検査。
- `storage-check.mjs`: 2件通過。予定CRUD、DBを閉じた後の保持、競合拒否、設定の保持・検証、保存失敗。
- `browser-check.mjs`: macOS上のChrome 152.0.7977.84（ヘッドレス、専用プロファイル）で14項目通過。
- 実ブラウザエンジンで起動、予定入力エラー、25時予定CRUD、実日時プレビュー、境界・フォント・秒設定、再読み込み後保持、ICSファイル内容、ダウンロードへの切替を確認。
- 320×568、390×844、768×1024、844×390の画面幅。横スクロールなし、編集フォームをスクロールして保存可能。スクリーンショットを確認し、狭い画面の日付入力を修正。
- オフラインで再読み込み、予定追加・編集・削除、ICS作成。ブラウザプロセス終了後、同じ専用プロファイルでオフライン再起動し、予定・設定の保持を確認。
- Chrome DevToolsのmanifest解析エラー0、インストール要件エラー0。SW scopeがPWAに限定されることを確認。
- Mac / Windowsページを390px幅で表示確認。SW controllerはnull、PWA導線あり。
- アプリのJavaScript例外0。検証中の外部オリジンリクエスト0。入力内容の送信APIを追加していないこともソースで検査。

## 実機確認・未確認事項

専用の操作用Browser接続は利用できなかったため、Playwrightによる独立したヘッドレスChromeの実ブラウザエンジン検証を実施しました。普段のブラウザプロファイルは使用していません。テストツールはPWA公開物に含めません。

iPhone/iPad Safari、Android Chrome、Windows Edge/Chrome、Mac Safariの実機操作は未実施です。Mac Chromeの通常ウィンドウでの手動操作、OSへの実インストールとstandaloneの実起動、モバイルの実ソフトウェアキーボード、OS共有シートから各カレンダーへの最終取り込みも未実施です。manifestとインストール要件の検査は、これらの実機確認を代替したという意味ではありません。

## 既知の制限・今後

- データはブラウザごと。サイトデータ削除、ストレージ回収、プライベートブラウズで失われる可能性があります。
- ICSの取り込み・同一UIDの扱いはカレンダー依存。PWAからの編集・削除は同期しません。
- 端末タイムゾーンを変えると現地表示が変わります。元の瞬間は保持します。
- ブラウザのスリープ／バックグラウンドでは更新頻度が制限されます。復帰時に端末時刻に追従します。
- オフライン初回起動不可。更新後は全PWAを閉じて開き直してください。
- 重要予定の復元用途には、現在は一括ICSをカレンダーへ取り込む方式。将来候補はJSONバックアップ・復元、各OS実機検証、カレンダー取り込みの互換性確認です。

## 公開方式

GitHub Pagesの既存設定 `main /docs` を維持します。変更したソースと `docs/pwa/`、2つの紹介HTMLを同一コミットで公開する方式です。Pages設定変更、認証情報、APIキー、新しいサービス契約は不要です。

ローカル確認は `node scripts/serve-pwa.mjs` の後、`http://localhost:4173/yofukashi-clock-25/pwa/` を開きます。再公開時は `node scripts/export-pwa.mjs` または既存の `npm run build:pages` で公開物を更新してください。
