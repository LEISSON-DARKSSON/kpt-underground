export function NextSteps() {
  const steps = [
    {
      num: "01",
      status: "done" as const,
      title: "ORDER CONFIRMED",
      desc: "Your order has been received and payment verified. Equipment assembly begins now.",
      eta: null,
    },
    {
      num: "02",
      status: "pending" as const,
      title: "PREPARATION",
      desc: "Your equipment is being quality-checked against AQL 2.5 standard before packaging.",
      eta: "24-48 HRS",
    },
    {
      num: "03",
      status: "upcoming" as const,
      title: "DISPATCH",
      desc: "Tracking number sent via email. DHL Express handles all KPT shipments.",
      eta: "3-5 DAYS",
    },
    {
      num: "04",
      status: "upcoming" as const,
      title: "SIGNAL NETWORK",
      desc: "Full signal network access activates on delivery confirmation. Your frequency is registered.",
      eta: "ON DELIVERY",
    },
  ];

  return (
    <div className="flex flex-col mt-6" style={{ gap: 2 }}>
      {steps.map((step) => (
        <div
          key={step.num}
          className="grid items-start transition-colors duration-200"
          style={{
            gridTemplateColumns: "80px 1fr",
            background: "rgba(5, 5, 5, 0.9)",
            borderLeft: `2px solid ${
              step.status === "done" ? "var(--green)" :
              step.status === "pending" ? "var(--orange)" :
              "rgba(138,206,0,0.15)"
            }`,
          }}
        >
          {/* Number */}
          <div className="flex items-center justify-center py-6">
            <span
              className="font-display text-[52px] leading-none"
              style={{
                color: step.status === "done" ? "rgba(138,206,0,0.35)" :
                       step.status === "pending" ? "rgba(255,140,0,0.25)" :
                       "rgba(138,206,0,0.15)",
              }}
            >
              {step.num}
            </span>
          </div>

          {/* Content */}
          <div className="py-5 pr-6">
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-2">
              {step.status === "done" && (
                <span className="font-mono text-[7px] tracking-[0.4em] text-green uppercase flex items-center gap-1.5">
                  <span className="text-[10px]">✓</span> COMPLETED
                </span>
              )}
              {step.status === "pending" && (
                <span className="font-mono text-[7px] tracking-[0.4em] text-orange uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange" style={{ animation: "blink 1.4s step-end infinite" }} />
                  IN PROGRESS
                </span>
              )}
              {step.status === "upcoming" && (
                <span className="font-mono text-[7px] tracking-[0.4em] text-muted uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full border border-muted" />
                  UPCOMING
                </span>
              )}
            </div>

            <h3 className="font-display text-[24px] tracking-[0.06em] text-paper leading-none mb-2">
              {step.title}
            </h3>
            <p className="font-mono text-[11px] text-muted leading-[1.8]">
              {step.desc}
            </p>

            {step.eta && (
              <span
                className="inline-block mt-3 font-mono text-[8px] tracking-[0.2em] uppercase px-3 py-1 border"
                style={{
                  color: "var(--green)",
                  borderColor: "rgba(138,206,0,0.2)",
                  background: "rgba(138,206,0,0.03)",
                }}
              >
                ETA: {step.eta}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
