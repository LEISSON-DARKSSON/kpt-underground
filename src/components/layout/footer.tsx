import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/story", label: "STORY" },
  { href: "/artists", label: "ARTISTS" },
  { href: "/shop", label: "EQUIPMENT" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative"
      style={{
        zIndex: 1,
        borderTop: "1px solid rgba(138, 206, 0, 0.06)",
        padding: "48px 0 32px",
      }}
    >
      <div className="wrap">
        {/* Top row */}
        <div
          className="flex flex-col gap-6"
          style={{ marginBottom: 48 }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              letterSpacing: "0.2em",
              color: "var(--green)",
            }}
          >
            KPT UNDERGROUND
          </span>

          <div className="flex gap-6 flex-wrap">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="hover"
                data-cursor-label={link.label}
                style={{
                  fontSize: 8,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  textDecoration: "none",
                  transition: "color var(--mid)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(138, 206, 0, 0.06)",
            marginBottom: 24,
          }}
        />

        {/* Bottom row */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span
            style={{
              fontSize: 8,
              letterSpacing: "0.3em",
              color: "rgba(112, 128, 144, 0.3)",
              textTransform: "uppercase",
            }}
          >
            {year} KPT-UNDERGROUND // ALL RIGHTS RESERVED
          </span>
          <span
            style={{
              fontSize: 8,
              letterSpacing: "0.3em",
              color: "rgba(112, 128, 144, 0.3)",
              textTransform: "uppercase",
            }}
          >
            10% OF EVERY TRANSACTION FUNDS UNDERGROUND ARTISTS
          </span>
        </div>
      </div>
    </footer>
  );
}
