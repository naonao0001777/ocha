import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ocha - プロフィールサービス",
  description: "Ochaはリンクをまとめてプロフィールに追加することができるプロフィールサービスです",
  icons: {
    icon: '/assets/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* OGP設定 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ocha" />
        <meta property="og:description" content="Ochaはリンクを貼るプロフィールWebサービスです" />
        <meta property="og:url" content="https://ocha.onrender.com/" />
        <meta property="og:site_name" content="Ocha" />
        <meta property="og:image" content="https://user-images.githubusercontent.com/46675984/269119261-5a61b35d-27d1-4a8b-99cf-dbbdd2bfd279.png" />
        {/* Twitterカードの設定 */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@salty_special" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
