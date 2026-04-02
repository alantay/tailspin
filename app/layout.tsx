import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import OfflineIndicator from "@/components/OfflineIndicator";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tailspin",
  description: "Share pet boarding photos with owners",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tailspin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <OfflineIndicator />
      </body>
    </html>
  );
}
