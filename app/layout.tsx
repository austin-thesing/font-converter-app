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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {process.env.NODE_ENV !== "production" && <div style={{ background: "yellow", padding: "10px", textAlign: "center" }}>Development Mode</div>}
        <ErrorBoundary fallback={<ErrorFallback />}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

function ErrorFallback() {
  return <div>An error has occurred</div>;
}
