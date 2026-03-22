"use client";

const MANIFESTO_ITEMS = [
  "WE DO NOT ADVERTISE",
  "WE STAY UNDERGROUND",
  "EQUIPMENT NOT FASHION",
  "THE BASS IS THE FOUNDATION",
  "NO CONVENTIONAL CHANNELS",
  "SUPPORT THE ARTISTS",
  "KEEP THE FREQUENCY",
  "BUILD THE SYSTEMS",
];

export function ManifestoStrip() {
  const doubled = [...MANIFESTO_ITEMS, ...MANIFESTO_ITEMS];

  return (
    <section
      style={{
        background: "var(--ink2)",
        borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
        padding: 0,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        className="flex"
        style={{
          width: "max-content",
          animation: "ticker-scroll 45s linear infinite",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 56px)",
              letterSpacing: "0.08em",
              color: i % 2 === 0 ? "rgba(138, 206, 0, 0.06)" : "rgba(138, 206, 0, 0.12)",
              padding: "24px 40px",
              whiteSpace: "nowrap",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
