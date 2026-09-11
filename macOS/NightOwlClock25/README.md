# 夜ふかし時計25時

macOS 14以降向けのSwiftUIデスクトップ時計・予定管理アプリです。アナログ時計は実日時を、デジタル時計と予定は設定した境界に基づく生活日時を表示します。

## 構成

- `Models`: `LogicalDateTime` とローカル予定
- `Services`: Calendarベースの日時変換、JSON永続化、EventKit、ウィンドウ制御
- `Views`: アナログ/デジタル時計、設定、予定編集・一覧、Calendar登録確認
- `NightOwlClock25Tests`: 25時記法、境界、暦・タイムゾーンのテスト

予定は少量の個人データを想定し、スキーマ移行を要するSwiftDataではなくCodable JSONとしてApplication Supportへ原子的に保存します。設定はAppStorage、ウィンドウ位置とサイズはNSWindowのフレーム自動保存を使用します。

ウィンドウは通常のNSWindowとしてMission Controlの管理対象になります。設定の「常に最前面」（初期値OFF）、「すべてのデスクトップに表示」（初期値ON）、「フルスクリーンアプリ上にも表示」（初期値OFF）は独立して保存されます。特定のデスクトップへ移動して使う場合は「すべてのデスクトップに表示」をOFFにしてください。

設定ウィンドウはメインウィンドウと独立して、設定ボタンまたはメニュー（⌘,）を押したデスクトップに表示します。同じウィンドウを再利用し、表示前に毎回 `.moveToActiveSpace` を適用します。`.stationary`、`.transient`、`.canJoinAllSpaces` は除去します。

設定の「デジタル時計のフォント」→「変更…」で、インストール済みフォントを検索し、書体とサイズ（10〜144 pt）を選択できます。25時記法のプレビューを表示し、変更は時計に即時反映されます。日付と時刻で同じ設定を使用し、幅が足りない場合は縮小表示します。アナログ時計と予定一覧には影響しません。

フォントのファミリー名・書体名・PostScript名・サイズはUserDefaultsに保存します。起動時とアプリ復帰時にフォントの存在を確認し、削除されていればシステム標準へ戻します。「標準に戻す」はシステム標準フォント・42 ptに戻します。対応フォントでは数字の等幅機能を使用しますが、選択したフォント自体は置き換えません。

## ビルドとテスト

```sh
xcodebuild build -project NightOwlClock25.xcodeproj -scheme NightOwlClock25 -configuration Debug
xcodebuild test -project NightOwlClock25.xcodeproj -scheme NightOwlClock25 -configuration Debug
```

Spacesの実機確認: 「すべてのデスクトップに表示」をONにして、デスクトップ1で設定を開いて閉じ、デスクトップ2の設定ボタンを押します。デスクトップ1に戻らず設定が表示されることを確認します。設定を開いたまま別のデスクトップへ移った場合と、メニュー（⌘,）からの再表示も確認してください。Space間の実際の移動はユニットテストの対象外です。

初回のCalendar登録時にアクセス許可が表示されます。署名して通常起動する際は、XcodeのSigning & Capabilitiesで個人のDevelopment Teamを選択してください。
