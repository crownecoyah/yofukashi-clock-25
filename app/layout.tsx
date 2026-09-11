import type { Metadata } from "next";
import "./globals.css";

const title = "夜ふかし時計25時 — 0時を過ぎても、今日の続き。";
const description = "一日の境界を自分で決める、macOS用の25時記法の時計・予定管理アプリ。macOS 14以降、Apple Silicon / Intel対応。";
export const metadata: Metadata = {
  metadataBase: new URL("https://crownecoyah.github.io/yofukashi-clock-25/"),
  title, description,
  alternates: { canonical: "https://crownecoyah.github.io/yofukashi-clock-25/" },
  icons: { icon: "/images/app-icon.png" },
  openGraph: { title, description, type: "website", locale: "ja_JP", url: "https://crownecoyah.github.io/yofukashi-clock-25/", images: [{ url: "https://crownecoyah.github.io/yofukashi-clock-25/og.png", width: 1733, height: 907, alt: "夜ふかし時計25時 — 0時を過ぎても、今日の続き。" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://crownecoyah.github.io/yofukashi-clock-25/og.png"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
