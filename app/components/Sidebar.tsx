"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const nav = [
  {
    href: "/",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/pre-auth",
    label: "Pre-Auth Queue",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    href: "/reimbursements",
    label: "Reimbursements",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 30,
        height: "100vh",
        width: "var(--sidebar-width)",
        background: "var(--color-white)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image
            src="/logo/rxpay.png"
            alt="RxPay"
            width={72}
            height={24}
            style={{ height: 22, width: "auto", objectFit: "contain" }}
          />
          <span style={{ width: 1, height: 18, background: "var(--color-border)", flexShrink: 0 }} />
          <Image
            src="/logo/akna.png"
            alt="AKNA"
            width={52}
            height={20}
            style={{ height: 18, width: "auto", objectFit: "contain" }}
          />
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
        <p
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "0 8px",
            marginBottom: 6,
            marginTop: 4,
          }}
        >
          Workspace
        </p>
        {nav.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? " active" : ""}`}
              style={{ marginBottom: 1 }}
            >
              <svg
                style={{
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  strokeWidth: isActive ? 2 : 1.5,
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          AI Copilot for TPA
        </p>
        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-disabled)", marginTop: 2 }}>
          Claims · Pre-auth · Reimbursements
        </p>
      </div>
    </aside>
  );
}
