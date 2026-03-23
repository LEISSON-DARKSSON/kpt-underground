export default function Loading() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", paddingTop: "calc(80px + var(--sat))" }}
    >
      <div className="text-center">
        <span
          className="font-display text-2xl text-green"
          style={{ animation: "blink 1.6s step-end infinite" }}
        >
          KPT
        </span>
        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-3">
          LOADING SIGNAL...
        </p>
      </div>
    </div>
  );
}
