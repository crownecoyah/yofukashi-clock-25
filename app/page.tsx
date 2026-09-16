/* eslint-disable @next/next/no-img-element -- Native images keep the GitHub Pages export independent of an image server. */
const repository = "https://github.com/crownecoyah/yofukashi-clock-25";
const release = `${repository}/releases/tag/v1.0.0`;
const download = `${repository}/releases/download/v1.0.0/yofukashi-clock-25-v1.0.0-macOS.zip`;

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">本文へ移動</a>
      <header className="site-header wrap">
        <a className="brand" href="#main"><img src="/images/app-icon.png" width="40" height="40" alt="" />夜ふかし時計25時</a>
        <nav aria-label="メインナビゲーション"><a href="#features">できること</a><a href="#download">ダウンロード</a><a href={repository}>GitHub ↗</a></nav>
      </header>
      <div className="os-switch wrap" role="navigation" aria-label="OS版の切り替え">
        <div className="os-tabs"><span aria-current="page">Mac版（表示中）</span><a href="./windows.html">Windows版</a><a href="./pwa/">ブラウザ版を今すぐ使う</a></div>
        <p><a href="./windows.html">Windows版はこちら →</a></p>
      </div>
      <main id="main">
        <section className="ios-recruit wrap" aria-labelledby="ios-recruit-title">
          <p className="eyebrow">iOS版 開発協力者募集</p>
          <h2 id="ios-recruit-title">iOS版を一緒に作ってくださる方を探しています！</h2>
          <p>macOS版はSwift／SwiftUIで実装済み。25時記法の変換ロジックとテストがあり、MIT Licenseで利用・改変できます。</p>
          <p><strong>最初から全機能を完成させる必要はありません。</strong>設計相談、一部分だけの参加、設計提案やコードレビューも歓迎します。</p>
          <p>仕様説明、テスト、フィードバックはプロジェクト側が担当。貢献者はご本人の希望を確認し、iOS版開発者としてREADMEとサイトに掲載します。</p>
          <div className="ios-actions"><a className="button primary" href="./ios-port.html">iOS版の開発計画を見る</a><a className="button secondary" href="https://github.com/crownecoyah/yofukashi-clock-25/issues/1">GitHubで相談する</a></div>
        </section>
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">YOUR DAY, AT YOUR OWN PACE</p>
            <h1>0時を過ぎても、<br />まだ<span>今日の続き。</span></h1>
            <p className="intro">夜の続きを、25時で。<br />あなたの一日の区切りに寄り添う、<br />Macのための時計と予定管理。</p>
            <a className="button primary" href={download}>Mac版をダウンロード <span aria-hidden="true">↓</span></a>
            <p className="download-meta">v1.0.0 · macOS 14以降 · Apple Silicon / Intel</p>
            <p className="signing-note">Developer ID署名・公証は未実施です。<a href="#download">ご利用前に</a></p>
          </div>
          <div className="time-example" aria-label="午前1時25分を前日の25時25分として表示する例">
            <p className="example-label">夜ふかし時計25時</p>
            <p className="logical-date">9月10日、今日の続き。</p>
            <p className="large-time">25<span>:</span>25</p>
            <div className="time-caption"><span>実際の日時</span><span>9月11日 01:25</span></div>
            <p className="boundary-caption">一日の境界を午前5時にした場合の表示例</p>
          </div>
        </section>
        <section className="story wrap" id="features">
          <p className="eyebrow">A LITTLE MORE OF TODAY</p>
          <h2>日付よりも、<br className="mobile-break" />生活のリズムに合わせて。</h2>
          <div className="features">
            <article><span className="feature-number">01</span><h3>一日の終わりを、自分で。</h3><p>午前何時までを前日の続きにするか、0〜12時から選べます。アナログ時計は、いつもの実際の時刻を表示。</p></article>
            <article><span className="feature-number">02</span><h3>予定も、そのまま25時で。</h3><p>25時、26時を使って予定を入力。Calendarへ登録するときは、変換後の日時を確認できます。</p></article>
            <article><span className="feature-number">03</span><h3>いつものデスクトップに。</h3><p>フォントやサイズ、最前面表示をあなた好みに。すべてのデスクトップで時計を表示できます。</p></article>
          </div>
        </section>
        <section className="story wrap" id="main-screen">
          <p className="eyebrow">MAIN WINDOW</p>
          <h2>時計も予定も、ひとつの画面で。</h2>
          <figure style={{ margin: "0 auto", maxWidth: 560 }}>
            <img src="/images/main-window.png" alt="アナログ時計、25時記法のデジタル時計、架空のサンプル予定を表示したメイン画面" width="733" height="1151" loading="lazy" style={{ width: "100%", height: "auto" }} />
            <figcaption style={{ fontSize: 12, lineHeight: 1.8, color: "var(--muted)", textAlign: "center", marginTop: 16 }}>メイン画面。表示されている予定名と日時は、公開用の架空サンプルです。</figcaption>
          </figure>
        </section>
        <section className="settings-section">
          <div className="settings-grid wrap">
            <div className="settings-image"><img src="/images/settings-window.png" alt="一日の境界、秒表示、フォント、最前面表示などを選べる設定画面" width="1000" height="1086" loading="lazy" /></div>
            <div><p className="eyebrow">MAKE IT YOURS</p><h2>あなたにとっての<br />「今日」を決める。</h2><p className="section-copy">夜の作業にも、配信の時間にも。<br />時計の見え方を変えて、いつものMacに。</p><ul className="setting-list"><li>一日の境界・秒の表示</li><li>デジタル時計のフォント・サイズ</li><li>最前面・Spaces・フルスクリーン表示</li><li>ログイン時の自動起動</li></ul></div>
          </div>
        </section>
        <section className="download-section wrap" id="download">
          <p className="eyebrow">READY WHEN YOU ARE</p><h2>今夜から、25時で。</h2><p>macOS 14以降 · Apple Silicon / Intel両対応 · MIT License</p>
          <div className="download-actions"><a className="button primary" href={download}>v1.0.0をダウンロード ↓</a><a className="button secondary" href={release}>リリース詳細・ソースコード ↗</a></div>
          <div className="release-notice"><h3>ご利用前に</h3><p>このバージョンはアドホック署名で、Developer ID署名・Appleの公証は行っていません。macOSが起動を制限する場合があります。内容をご確認のうえご利用ください。Xcodeでソースからビルドすることもできます。</p><p>予定と設定はMac内に保存します。Calendar登録にはアクセス許可が必要です。登録後の同期は、選択したCalendarアカウントの設定に従います。</p><a href={`${repository}/blob/main/macOS/NightOwlClock25/README.txt`}>詳しい使い方を読む ↗</a><a href={`${repository}/releases/download/v1.0.0/SHA256SUMS.txt`}>SHA-256を確認 ↗</a></div>
        </section>
      </main>
      <footer className="wrap"><div className="footer-brand">夜ふかし時計25時<span>あなたの一日は、あなたのペースで。</span></div><div><a href={repository}>GitHub</a><a href={`${repository}/blob/main/LICENSE.txt`}>MIT License</a><p>© 2026 黒猫屋倫彦</p></div></footer>
    </>
  );
}
