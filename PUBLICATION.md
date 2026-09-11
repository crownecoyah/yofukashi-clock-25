# v1.0.0 公開内容

公開先: `crownecoyah/yofukashi-clock-25`。公開対象の個別ファイル名は [PUBLIC-FILES.txt](PUBLIC-FILES.txt) に記載します。

## 公開するもの

- `macOS/NightOwlClock25/`: 配布用コピーを基準にしたSwiftソース、Xcode共有設定、テスト、アイコン、利用説明。
- `app/`、`public/`: 配布サイト。予定が写ったメイン画面画像は使わず、設定画面とアイコンを使用。
- `docs/`: GitHub Pages用の静的ページ。配信時にJavaScript、データベース、認証は不要。
- README、MIT License、ビルド設定、ローカルの配布生成・監査スクリプト。
- Release添付: Universal macOSアプリZIP、ソースZIP、SHA256SUMS.txt。

## 公開しないもの

元の作業用コピー、古い配布物、`.DS_Store`、`xcuserdata/`、`*.xcuserstate`、DerivedData、Debugアプリ・テストバンドル、ログ、`node_modules/`、ローカルのバックアップ、認証情報、予定データ。これらは削除せずGitの対象外にします。

`release/`のZIPはGitの履歴には入れず、検証した3ファイルだけをReleaseへ添付します。`.openai/hosting.json`は空の論理バインディング設定のみで、認証情報を含みません。

## 今回の修正

- 公開用ソースを `macOS/NightOwlClock25/` に集約。アプリの動作ロジックは変更せず、バージョンを1.0.0に統一。
- ひな形だったルートREADMEをアプリ説明・取得方法・ビルド手順へ変更。
- MIT Licenseの未置換の著作権記入欄を除去。既存の著作権者表記は保持。
- Xcodeの個人設定・秘密ファイル・重複した作業コピーの除外を追加。
- 配布時のSwift/Clangのパス置換とデバッグシンボルの除去を追加し、署名前に実行ファイルを走査。
- 予定情報が写っていない配布サイトを作成。新しい共有画像はAI生成。

## 検証と限界

- Release Universalビルド、arm64/x86_64の両方、バージョン、アドホック署名を確認。
- ZIPを再展開し、署名検証・実行権限・CRCを確認。ローカルユーザーパスと典型的な秘密情報パターンの非検出を確認。
- macOSアプリの既存テスト16件成功、0失敗（Apple Silicon）。サイトの静的配信テスト3件成功、0失敗。ESLintも成功。
- 静的サイトのローカル参照・ページ内リンク・配布先URL・メタデータをテスト。
- 接続可能なブラウザがないため、ブラウザの目視検証は未実施。HTTP応答と静的ファイルの検査で配信を確認。
- Spaces間の移動、Calendar権限の初回ダイアログ、Intel Mac上の実行は今回の自動検査対象外。
- Developer ID署名・Apple公証は未実施。macOSが起動を制限する場合があります。
- パターン走査は未知の秘密情報やすべての個人情報の不在を保証するものではありません。
