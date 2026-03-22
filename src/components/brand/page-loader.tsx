"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGone(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="loader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-loader)" as string,
        background: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: gone ? 0 : 1,
        visibility: gone ? "hidden" : "visible",
        transition: "opacity 0.8s ease, visibility 0.8s ease",
        pointerEvents: gone ? "none" : "auto",
      }}
    >
      {/* Brand mark */}
      <div
        style={{
          width: "min(210px, 54vw)",
          height: "min(210px, 54vw)",
          marginBottom: 24,
          animation: "loader-pulse 0.45s ease infinite alternate",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 12vw, 72px)",
            letterSpacing: "0.15em",
            color: "var(--green)",
            lineHeight: 1,
          }}
        >
          KPT
        </span>
      </div>

      {/* Loading labels */}
      {["INITIALIZING SYSTEMS", "LOADING FREQUENCIES", "CONNECTING SIGNAL"].map(
        (label, i) => (
          <span
            key={label}
            style={{
              fontSize: 8,
              letterSpacing: "0.45em",
              color: "var(--green)",
              textTransform: "uppercase",
              opacity: 0,
              animation: `fadeup 0.3s ease ${0.3 + i * 0.35}s forwards`,
            }}
          >
            {label}
          </span>
        )
      )}

      {/* Progress bar */}
      <div
        style={{
          width: "min(170px, 50vw)",
          height: 1,
          background: "rgba(138, 206, 0, 0.1)",
          marginTop: 16,
          overflow: "hidden",
          opacity: 0,
          animation: "fadeup 0.3s ease 1.35s forwards",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--green)",
            width: 0,
            animation: "loader-fill 0.9s ease 1.45s forwards",
          }}
        />
      </div>
    </div>
  );
}
