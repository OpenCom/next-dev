import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Wrapper from "@/components/global/Wrapper";
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
  title: "NOTE SPESE - PDM Power",
  description: "Gestione note spese PDM Power by OpenCom",
  robots: 'noindex, nofollow',
  icons: {
    icon: '/favicon.ico'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
          <Wrapper>
            {children}
          </Wrapper>
      </body>
    </html>
  );
}
