"use client";

import { useState, useEffect } from "react";

const BAR_ANIMATIONS = [
  { name: "bar1", duration: "0.8s", defaultH: 3 },
  { name: "bar2", duration: "0.6s", defaultH: 8 },
  { name: "bar3", duration: "0.9s", defaultH: 5 },
  { name: "bar4", duration: "0.7s", defaultH: 11 },
  { name: "bar5", duration: "0.5s", defaultH: 6 },
];

export function AudioToggle() {
  const [isOn, setIsOn] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={() => setIsOn((prev) => !prev)}
      data-cursor="hover"
      data-cursor-label={isOn ? "MUTE" : "SOUND"}
      className="fixed"
      style={{
        bottom: 28,
        right: 28,
        zIndex: "var(--z-audio)" as string,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px",
        background: "rgba(5, 5, 5, 0.9)",
        border: "1px solid rgba(138, 206, 0, 0.12)",
        backdropFilter: "blur(10px)",
        cursor: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease, border-color var(--mid)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "rgba(138, 206, 0, 0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "rgba(138, 206, 0, 0.12)";
      }}
    >
      <div
        className="flex items-end gap-0.5"
        style={{ height: 12 }}
      >
        {BAR_ANIMATIONS.map((bar) => (
          <div
            key={bar.name}
            style={{
              width: 2,
              background: "var(--green)",
              borderRadius: 1,
              height: isOn ? undefined : 2,
              opacity: isOn ? 1 : 0.3,
              animation: isOn
                ? `${bar.name} ${bar.duration} ease-in-out infinite alternate`
                : "none",
              transition: "height 0.15s",
              ...(isOn ? {} : { height: 2 }),
              ...(!isOn ? {} : { height: bar.defaultH }),
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 7,
          letterSpacing: "0.4em",
          color: "var(--green)",
          textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
        }}
      >
        {isOn ? "ON" : "OFF"}
      </span>
    </button>
  );
}
