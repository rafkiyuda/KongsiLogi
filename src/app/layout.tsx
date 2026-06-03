import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KongsiLogi — Manajemen Koperasi",
  description: "Platform Manajemen Inventory & Rantai Pasok untuk Koperasi Melati Jaya. Kelola stok, pembelian, penjualan, audit, dan laporan dalam satu sistem terintegrasi.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
