import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealmForge",
  description: "FRP masaüstü oyunları için dijital yol arkadaşı arayüzü.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}