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
      <body className="antialiased font-sans">
        <main className="min-h-screen w-full overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}
