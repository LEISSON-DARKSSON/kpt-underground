"use client";

interface TickerProps {
  items: string[];
  duration?: number;
  reverse?: boolean;
}

export function Ticker({
  items,
  duration = 30,
  reverse = false,
}: TickerProps) {
  const doubled = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        zIndex: 1,
        borderTop: "1px solid rgba(138, 206, 0, 0.07)",
        borderBottom: "1px solid rgba(138, 206, 0, 0.07)",
        background: "rgba(138, 206, 0, 0.018)",
        padding: "11px 0",
        whiteSpace: "nowrap",
      }}
    >
      {/* Left fade */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none"
        style={{
          width: 60,
          zIndex: 2,
          background: "linear-gradient(90deg, var(--ink), transparent)",
        }}
      />
      {/* Right fade */}
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          width: 60,
          zIndex: 2,
          background: "linear-gradient(-90deg, var(--ink), transparent)",
        }}
      />

      <div
        className="inline-flex"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: 9,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--muted)",
              padding: "0 24px",
              transition: "color var(--mid)",
              cursor: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--green)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
