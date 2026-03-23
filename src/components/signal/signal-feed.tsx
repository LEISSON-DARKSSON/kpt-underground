"use client";

import { ScrollReveal } from "@/components/brand/scroll-reveal";

interface SignalEntry {
  id: string;
  timestamp: string;
  type: "LOCATION" | "FREQUENCY" | "EVENT" | "DROP" | "BROADCAST";
  content: string;
  status: "ACTIVE" | "EXPIRED" | "UPCOMING";
}

const SIGNALS: SignalEntry[] = [
  {
    id: "sig-007",
    timestamp: "2025-03-22T03:00:00Z",
    type: "LOCATION",
    content: "52.4934°N, 13.4437°E — Warehouse district. Gate 7. No signage. Follow the sub-bass.",
    status: "ACTIVE",
  },
  {
    id: "sig-006",
    timestamp: "2025-03-20T22:00:00Z",
    type: "FREQUENCY",
    content: "New transmission on 33Hz. Duration: 4 hours. Participants: unknown. Dress code: dark.",
    status: "ACTIVE",
  },
  {
    id: "sig-005",
    timestamp: "2025-03-18T01:30:00Z",
    type: "EVENT",
    content: "KRVN live hardware set — 3 hours. Location broadcast 60 minutes before start. No recording.",
    status: "UPCOMING",
  },
  {
    id: "sig-004",
    timestamp: "2025-03-15T04:00:00Z",
    type: "DROP",
    content: "Prototype Field Jacket — 12 units. Available through Signal Network only. No public sale.",
    status: "EXPIRED",
  },
  {
    id: "sig-003",
    timestamp: "2025-03-12T00:00:00Z",
    type: "BROADCAST",
    content: "Frequency embedded in last week's mix. First 20 to decode receive early access to SS-2025 collection.",
    status: "EXPIRED",
  },
  {
    id: "sig-002",
    timestamp: "2025-03-08T23:00:00Z",
    type: "LOCATION",
    content: "51.5074°N, 0.1278°W — Arch 42. Service entrance. The door is unmarked.",
    status: "EXPIRED",
  },
  {
    id: "sig-001",
    timestamp: "2025-03-01T02:00:00Z",
    type: "EVENT",
    content: "PHASE_NULL + NØISE.DEPT — joint set. Industrial zone. Capacity: 200. No phones.",
    status: "EXPIRED",
  },
];

function getTypeColor(type: SignalEntry["type"]): string {
  switch (type) {
    case "LOCATION": return "var(--green)";
    case "FREQUENCY": return "var(--green)";
    case "EVENT": return "var(--paper)";
    case "DROP": return "var(--orange)";
    case "BROADCAST": return "var(--slate)";
  }
}

function getStatusStyle(status: SignalEntry["status"]) {
  switch (status) {
    case "ACTIVE": return { color: "var(--green)", borderColor: "rgba(138,206,0,0.3)" };
    case "UPCOMING": return { color: "var(--orange)", borderColor: "rgba(255,140,0,0.3)" };
    case "EXPIRED": return { color: "var(--dim)", borderColor: "var(--dim)" };
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month} // ${hours}:${mins}`;
}

export function SignalFeed() {
  return (
    <section className="py-24">
      <div className="wrap">
        <ScrollReveal>
          <span className="eyebrow">SIGNAL LOG // {SIGNALS.length} ENTRIES</span>
        </ScrollReveal>

        <div className="mt-10 space-y-0">
          {SIGNALS.map((signal, i) => {
            const statusStyle = getStatusStyle(signal.status);
            return (
              <ScrollReveal key={signal.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div
                  className="border-t border-dim py-6 grid md:grid-cols-[100px_100px_1fr_90px] gap-4 items-start"
                  style={{ opacity: signal.status === "EXPIRED" ? 0.4 : 1 }}
                >
                  {/* Timestamp */}
                  <span className="font-mono text-[9px] tracking-[0.1em] text-muted">
                    {formatTimestamp(signal.timestamp)}
                  </span>

                  {/* Type badge */}
                  <span
                    className="font-mono text-[9px] tracking-[0.14em] uppercase"
                    style={{ color: getTypeColor(signal.type) }}
                  >
                    {signal.type}
                  </span>

                  {/* Content */}
                  <p className="font-mono text-[11px] text-paper/80 leading-relaxed">
                    {signal.content}
                  </p>

                  {/* Status */}
                  <span
                    className="font-mono text-[8px] tracking-[0.14em] uppercase border px-2 py-1 text-center"
                    style={statusStyle}
                  >
                    {signal.status === "ACTIVE" && (
                      <span style={{ animation: "blink 1.6s step-end infinite" }}>&#x25CF; </span>
                    )}
                    {signal.status}
                  </span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
