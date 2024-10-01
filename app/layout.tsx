import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@sentry/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NODE_ENV === "production" ? "Webfont Converter" : "Webfont Converter (Dev)",
  description: "Convert your fonts to WOFF and WOFF2 formats",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function DevBanner() {
  if (process.env.NODE_ENV !== "development") return null;
  return <div className="bg-yellow-400 text-black text-center py-1">Development Mode</div>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <DevBanner />
        {children}
      </body>
    </html>
  );
}
function ErrorFallback() {
  return <div>An error has occurred</div>;
}
