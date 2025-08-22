import type { Metadata } from "next";
// 临时移除Google字体以修复turbopack问题
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { CustomToaster } from "@/components/CustomToast";
import { RefreshProvider } from "@/contexts/RefreshContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Genesis NFT BlindBox",
  description: "Mint random Genesis Mecha NFTs using GEM tokens",
  keywords: ["NFT", "BlindBox", "Genesis", "Mecha", "Web3", "Ethereum"],
  authors: [{ name: "Genesis Team" }],
  openGraph: {
    title: "Genesis NFT BlindBox",
    description: "Mint random Genesis Mecha NFTs using GEM tokens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased bg-gray-900 text-white font-sans"
      >
        <Web3Provider>
          <RefreshProvider>
            {children}
          </RefreshProvider>
          <CustomToaster position="top-right" />
        </Web3Provider>
      </body>
    </html>
  );
}
