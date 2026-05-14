import type { Metadata, Viewport } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { defaultMetadata } from "@/lib/seo";
import { Toaster } from "sonner";
import "./globals.css";

const GOOGLE_FONTS_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=Playfair+Display:wght@400;500;600;700&display=swap";

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C8516A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={GOOGLE_FONTS_STYLESHEET} rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-center" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
