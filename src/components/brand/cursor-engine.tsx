"use client";

import { useEffect, useRef } from "react";

/* Dark halo + soft glow keep the crosshair readable on any surface, incl. the dimmed cart backdrop */
const CROSS_GLOW = "0 0 0 1px rgba(5,5,5,0.95), 0 0 8px rgba(138,206,0,0.55)";

export function CursorEngine() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    rafRef.current = requestAnimationFrame(updatePosition);

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("a, button, [data-cursor]");

      if (interactive) {
        const cursorType =
          interactive.getAttribute("data-cursor") || "hover";
        const cursorLabel =
          interactive.getAttribute("data-cursor-label") || "";

        document.body.classList.remove("ch", "cshop", "clock");

        switch (cursorType) {
          case "shop":
            document.body.classList.add("cshop");
            break;
          case "lock":
            document.body.classList.add("clock");
            break;
          default:
            document.body.classList.add("ch");
        }

        if (labelRef.current) {
          labelRef.current.textContent = cursorLabel;
        }
      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-cursor]")) {
        document.body.classList.remove("ch", "cshop", "clock");
        if (labelRef.current) {
          labelRef.current.textContent = "";
        }
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnter, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      id="cur"
      className="fixed top-0 left-0 pointer-events-none will-change-transform"
      style={{ zIndex: "var(--z-cursor)" as string }}
    >
      {/* Crosshair */}
      <div
        className="cc relative"
        style={{
          width: 26,
          height: 26,
          transition: "width var(--mid) var(--ease), height var(--mid) var(--ease)",
        }}
      >
        {/* Vertical line */}
        <span
          className="absolute left-1/2 -translate-x-1/2 h-full"
          style={{ width: 2, background: "var(--green)", boxShadow: CROSS_GLOW }}
        />
        {/* Horizontal line */}
        <span
          className="absolute top-1/2 -translate-y-1/2 w-full"
          style={{ height: 2, background: "var(--green)", boxShadow: CROSS_GLOW }}
        />
      </div>

      {/* Center gap */}
      <div
        className="cg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 8,
          height: 8,
          background: "var(--ink)",
          zIndex: 1,
          transition: "width var(--mid) var(--ease), height var(--mid) var(--ease)",
        }}
      />

      {/* Ring */}
      <div
        className="cr absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 0,
          height: 0,
          border: "1px solid rgba(138, 206, 0, 0)",
          transition:
            "width 280ms var(--ease), height 280ms var(--ease), border-color 280ms",
        }}
      />

      {/* Label */}
      <span
        ref={labelRef}
        className="cl absolute"
        style={{
          left: 22,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 7,
          letterSpacing: "0.4em",
          color: "var(--green)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          opacity: 0,
          transition: "opacity var(--mid)",
        }}
      />
    </div>
  );
}
