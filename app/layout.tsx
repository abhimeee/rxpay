import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RxPay | Claims & Pre-Auth",
  description: "RxPay — AI-powered TPA copilot for claims verification, pre-auth completeness, fraud detection, and IRDAI compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <main className="min-h-screen overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}
