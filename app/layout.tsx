import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import { config } from "dotenv";

config({ path: ".env" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeXtRay - Chat Analysis & Insights",
  description: "AI-powered chat analysis tool for messaging platforms",
  applicationName: "TeXtRay",
  authors: [{ name: "Arjun Vijay Prakash" }],
  generator: "Next.js",
  keywords: ["chat analysis", "messaging", "analytics", "AI", "insights", "communication patterns"],
  referrer: "origin-when-cross-origin",
  creator: "Arjun Vijay Prakash",
  publisher: "Arjun Vijay Prakash",
  metadataBase: new URL(process.env.APP_URL!),
  openGraph: {
    title: "TeXtRay - Chat Analysis & Insights",
    description: "AI-powered chat analysis tool for messaging platforms",
    type: "website",
    siteName: "TeXtRay",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 600,
        alt: "TeXtRay - Chat Analysis & Insights"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TeXtRay - Chat Analysis & Insights", 
    description: "AI-powered chat analysis tool for messaging platforms",
    images: ["/og-image.png"]
  },
  icons: "/logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}