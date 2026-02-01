import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pl-56">{children}</main>
        </div>
      </body>
    </html>
  );
}
