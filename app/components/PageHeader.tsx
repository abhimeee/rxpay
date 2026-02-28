import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title?: string;
  subtitle?: string;
  /** @deprecated kept for API compatibility */
  titleVariant?: "default" | "navy";
  actions?: React.ReactNode;
}) {
  return (
    <>
      {/* Valley-style topbar — 44px height */}
      <div
        style={{
          height: "var(--topbar-height)",
          background: "var(--color-white)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "var(--font-size-base)",
            color: "var(--color-text-muted)",
          }}
        >
          <Link
            href="/"
            style={{ color: "var(--color-text-muted)", textDecoration: "none", transition: "color 0.1s" }}
          >
            RxPay
          </Link>
          {title && (
            <>
              <span style={{ color: "var(--color-border-dark)" }}>/</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{title}</span>
            </>
          )}
        </div>

        {/* Right-side actions */}
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {actions}
          </div>
        )}
      </div>

      {/* Optional page-level title section below topbar */}
      {subtitle && (
        <div
          style={{
            padding: "16px 20px",
            background: "var(--color-white)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        </div>
      )}
    </>
  );
}
