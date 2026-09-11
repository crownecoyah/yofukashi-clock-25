夜ふかし時計25時
==================

「夜ふかし時計25時」は、午前0時を過ぎても、設定した時刻までは
前日の続きとして表示できるmacOS用の時計・予定管理アプリです。

たとえば「5時まで前日の続き」と設定している場合、実際の日時が
7月8日 午前1時25分なら、アプリでは次のように表示されます。

    生活日付：7月7日
    時刻：25:25

アナログ時計は通常どおり、実際の時刻である1時25分を示します。


主な機能
--------

・現在時刻を示すアナログ時計
・生活日付と24時以降の時刻を示すデジタル時計
・一日の境界時刻の変更
・秒表示のON／OFF
・デジタル時計のフォント変更
・予定の作成、編集、削除、ローカル保存
・25時、26時などを使用した予定入力
・macOS Calendarへの予定登録
・常に最前面に表示
・すべてのデスクトップ（Spaces）に表示
・ウィンドウの位置とサイズの保存


起動方法
--------

1. 「夜ふかし時計25時.app」を「アプリケーション」フォルダへ移動します。
2. アプリをダブルクリックして起動します。

開発用プロジェクトから起動する場合は、Xcodeでプロジェクトを開き、
実行先に「My Mac」を選択して、画面左上の実行ボタンを押してください。
キーボードでは Command＋R でも実行できます。

v1.0.0はアドホック署名で、Developer ID署名・Appleの公証は行っていません。
macOSが起動を制限する場合があります。ソースからXcodeでビルドすることもできます。


25時記法について
----------------

このアプリでは、深夜の時刻を前日の24時以降として扱えます。

    アプリ上の日時             実際の日時
    1月1日 24:00       →       1月2日 00:00
    1月1日 25:00       →       1月2日 01:00
    1月1日 28:00       →       1月2日 04:00

一日の境界を5時に設定すると、午前0時から午前4時59分までは前日の
24時台から28時台として表示され、午前5時に当日の日付へ切り替わります。

「一日の境界」は現在時刻の表示方法を決める設定です。予定入力では、
境界時刻とは別に24時以上の時刻を選択できます。


予定を作成する
--------------

1. メイン画面の「予定を追加」を押します。
2. タイトル、開始日時、終了日時などを入力します。
3. 必要に応じて、登録先のカレンダーとメモを指定します。
4. 保存ボタンを押します。

例として、1月1日 25:00から28:00までの予定を作成すると、実際には
1月2日 午前1時から午前4時までの予定として扱われます。

終了日時は開始日時より後にしてください。


macOS Calendarへ登録する
-------------------------

予定一覧にあるCalendar登録ボタンを押すと、変換前の25時記法と、
Calendarへ実際に登録される通常の日時が確認画面に表示されます。
内容を確認して登録してください。

初回登録時には、macOSからCalendarへのアクセス許可を求められます。
許可しなかった場合は、次の場所から変更できます。

    システム設定
      → プライバシーとセキュリティ
      → カレンダー
      → 夜ふかし時計25時

Google CalendarをmacOSの「インターネットアカウント」に追加している場合、
EventKitから利用可能なGoogleカレンダーも登録先として表示されることが
あります。本アプリはGoogle Calendar APIへ直接接続しません。


設定
----

一日の境界
    午前何時までを前日の続きとして表示するか設定します。
    初期値は5時です。

秒表示
    ONにすると、デジタル時計に秒を表示し、アナログ時計に秒針を表示します。

常に最前面
    ONにすると、ほかの通常ウィンドウより前に時計を表示します。

すべてのデスクトップに表示
    ONにすると、macOSのデスクトップ（Spaces）を切り替えても時計が
    表示されます。

デジタル時計のフォント
    macOSにインストールされているフォントから、デジタル時計の字体、
    書体、サイズを変更できます。読みづらくなった場合は
    「標準に戻す」を選択してください。


Mission Controlとデスクトップ表示
-----------------------------------

時計をすべてのデスクトップで使用する場合は、設定の
「すべてのデスクトップに表示」をONにしてください。

macOS側から設定する場合は、Dockにある本アプリのアイコンを右クリックし、
「オプション」→「割り当て先」→「すべてのデスクトップ」を選択します。


データの保存
------------

作成した予定と各種設定はMac内に保存されます。本アプリ独自のサーバーへ
送信されることはありません。

Calendarへ登録した予定は、選択したCalendarアカウントの同期設定に従って
保存・同期されます。アプリ内の予定を削除しても、すでにCalendarへ登録した
予定が自動的に削除されない場合があります。


困ったときは
------------

Calendarが表示されない
    システム設定の「プライバシーとセキュリティ」→「カレンダー」で、
    本アプリのアクセスが許可されているか確認してください。

Googleカレンダーが選択肢にない
    macOSの「インターネットアカウント」にGoogleアカウントが登録され、
    カレンダー同期がONになっているか確認してください。

ウィンドウが見つからない
    Dockのアイコンをクリックするか、Mission Controlで確認してください。
    「すべてのデスクトップに表示」の設定も確認してください。

時計表示が小さい、または欠ける
    ウィンドウを広げるか、設定でデジタル時計のフォントサイズを小さく
    してください。必要ならフォント設定を標準に戻してください。

時刻表示がずれた
    アプリを一度前面に戻してください。それでも直らない場合は再起動し、
    macOSの日付、時刻、時間帯の設定を確認してください。


動作環境
--------

・macOS 14以降
・Calendar登録機能の利用にはCalendarへのアクセス許可が必要です。

対応するmacOSの最低バージョンは、配布時のアプリまたはXcodeプロジェクトの
Deployment Targetを確認してください。


ソースコードからビルドする場合
--------

1. NightOwlClock25.xcodeprojをXcodeで開きます。
2. TARGETS → Signing & Capabilitiesを開きます。
3. Teamで自分のApple IDまたはDeveloper Teamを選択します。
4. Bundle Identifierが重複する場合は、自分用の値へ変更します。
5. 実行先に「My Mac」を選択し、Command＋Rで実行します。


制作について
------------

「夜ふかし時計25時」の基本的なアイデア、仕様の方向性および
最終的な採否の判断は、黒猫屋倫彦が行いました。

ソースコード、ユーザーインターフェース、ドキュメントおよび
アプリアイコンの大部分は、黒猫屋倫彦の指示と確認のもと、
OpenAIのChatGPTおよびCodexを使用して生成・編集されています。

生成された内容は、動作確認、修正および構成の調整を行ったうえで
本ソフトウェアに採用しています。

ChatGPTおよびCodexは、本ソフトウェアの著作権者、配布者または
保守責任者ではありません。
本ソフトウェアに関する問い合わせや責任をOpenAIが負うものではありません。

着想・参考にしたソフトウェア
----------------------------

「夜ふかし時計25時」は、safetypin氏が開発したWindows用ソフトウェア
「TimerA」から着想を得て制作しました。

TimerAが備えていた、

・一日の区切りとなる時刻をユーザーが設定できること
・午前0時以降を前日の24時、25時、26時……として表示できること
・同じ時刻表記を予定やアラームの入力にも使用できること

という考え方を参考にしています。

TimerAについては、次の紹介記事を参照しました。

Vector「TimerA - 25時、26時といった表示もできる
フレキシブルなタイマ／アラームソフト」
https://www.vector.co.jp/magazine/softnews/050115/n0501153.html
（2005年1月15日掲載）

「夜ふかし時計25時」はTimerAのソースコードやプログラム本体を
利用したものではなく、公開されている紹介記事から得た着想をもとに、
macOS用の独立したソフトウェアとして新たに設計・実装したものです。

TimerAおよびその名称に関する権利は、原作者その他の正当な権利者に
帰属します。本ソフトウェアは、TimerAの作者または関係者による
公式な移植版、後継版、認定版ではありません。

制作時点では、TimerAの公式ウェブサイトおよび配布可能なプログラム本体を
確認できなかったため、現存する紹介記事を資料として参照しました。


ライセンス
----------

本ソフトウェアは、著作権その他の権利が成立する範囲において、
MIT Licenseのもとで提供されます。

Copyright (c) 2026 黒猫屋倫彦

利用、複製、改変、再配布等の条件については、同梱の
LICENSE.txtをご覧ください。

本ソフトウェアに含まれる第三者のライブラリ、フォントその他の
素材については、それぞれの権利者が定めるライセンスが適用されます。

本ライセンスは、配布者が本ソフトウェアについて保有し、または
許諾する権限を有する著作権その他の権利に適用されます。

著作権が成立しないと判断される部分について、配布者は、
法令上可能な最大限の範囲で、MIT Licenseと同等の条件による
自由な利用、複製、改変および再配布を認めます。

アプリアイコンもChatGPTを使用して生成されています。
アプリアイコンには、本ソフトウェアと同じMIT Licenseを適用します。

本プロジェクトのMIT Licenseは、「夜ふかし時計25時」のソースコード、
ドキュメントおよび独自に制作された画像素材に適用されます。

TimerAのプログラム、名称、画像、文章その他の著作物に対して
本プロジェクトのMIT Licenseを適用するものではありません。

注意事項
--------

本アプリは時計表示と個人用の予定管理を補助するものです。重要な予定は、
登録後にmacOS Calendar側でも日時と保存先を確認してください。



配布ソースのビルド・検証補足
==========================

夜ふかし時計25時 — ソースコード配布版

動作環境・開発環境
・macOS 14以降。SwiftUI / AppKitを使用するmacOSアプリです。
・検証環境: Xcode 26.6 (17F113)、macOS SDK 26.5。
・Apple Silicon / Intel向けのビルドに対応します。実行テストはApple Siliconで実施します。
・外部Swift Packageへの依存はありません。Package.resolvedのpinsは空です。

同梱ファイル
NightOwlClock25.xcodeproj: プロジェクト、共有Scheme、内部Workspace、Package.resolved
NightOwlClock25/App: 起動処理、ContentView、Info.plist、entitlements
NightOwlClock25/Models、Services、Views: すべてのアプリSwiftソース
NightOwlClock25/Assets.xcassets: アイコン素材
NightOwlClock25Tests: ユニットテスト
README.md: 機能説明
LICENSE.txt: 利用条件

Xcodeで開いて実行する
1. ZIPを展開し、NightOwlClock25.xcodeprojをXcodeで開きます。
2. Xcode > Settings > Accountsで自分のApple Accountを追加します。
3. プロジェクトのTARGETS > NightOwlClock25 > Signing & Capabilitiesを開きます。
4. Automatically manage signingをONにし、Teamに自分のApple Developer Teamを指定します。
5. Bundle Identifierのcom.example.NightOwlClock25を、自分が管理する一意の値へ変更します。
   例: com.yourorganization.NightOwlClock25（例示値はそのまま使わないでください）。
6. NightOwlClock25Testsターゲットにも同じTeamを指定し、Bundle Identifierを
   アプリのIdentifierにTestsを付けた一意の値へ変更します。DebugとReleaseの両方を確認します。
7. SchemeをNightOwlClock25、実行先をMy MacにしてProduct > Build、Product > Runを実行します。
8. Product > Test (Command-U)でユニットテストを実行します。
Team、証明書、プロビジョニングプロファイルは同梱していません。
Bundle Identifierを変更すると、保存設定や予定データの保存領域も別扱いになります。

コマンドラインでのクリーンビルドとテスト（署名なしの検証用）
Terminalで、このREADME.txtがあるディレクトリへ移動して実行します。
事前にXcodeを一度起動し、追加コンポーネントとライセンスの設定を済ませてください。
Xcode > Settings > Locations > Command Line Toolsで使用するXcodeを選択します。

xcodebuild clean build -project NightOwlClock25.xcodeproj -scheme NightOwlClock25 -configuration Release -destination 'generic/platform=macOS' -derivedDataPath ./DerivedData-Release ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO CODE_SIGNING_ALLOWED=NO

xcodebuild clean test -project NightOwlClock25.xcodeproj -scheme NightOwlClock25 -configuration Debug -destination 'platform=macOS' -derivedDataPath ./DerivedData-Tests CODE_SIGNING_ALLOWED=NO

これらのコマンドはローカル検証用です。通常起動用・再配布用は自身のTeamで署名してください。
Info.plistはAppターゲットのBuild Settings > Info.plist Fileから参照します。
アプリの機能変更やテスト追加は元のソースと同じくXcodeで編集できます。

第三者へ再配布する場合の署名
通常のmacOSセキュリティ設定で起動できる一般配布には、Developer ID Applicationによる
署名とAppleの公証が必要です。自分のApple DeveloperアカウントでProduct > Archiveから
Organizerを開き、Developer IDによる配布・公証を行ってください。
Apple公式: https://developer.apple.com/developer-id/
証明書、秘密鍵、APIキー、トークン、Apple Accountの認証情報をソースやZIPに入れないでください。

配布時の除外対象
DerivedData、DerivedData-*、build、dist、xcuserdata、*.xcuserstate、.DS_Store、
APIキー、credentials.json、トークン、証明書、秘密鍵、プロビジョニングプロファイル、
個人設定、ビルドログ、テスト結果、コンパイル済みSwiftモジュール。
本ソース配布版には元の個人用Bundle Identifier、ユーザー別Workspace設定を含めていません。
