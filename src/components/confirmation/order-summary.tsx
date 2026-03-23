"use client";

import { useCart } from "@/lib/cart-context";
import { formatEUR, getLineColor } from "@/lib/products";

export function OrderSummary() {
  const { items, totalPrice } = useCart();
  const artistContribution = Math.round(totalPrice * 0.1);

  /* If cart is empty, show placeholder order */
  const displayItems = items.length > 0 ? items : [];
  const displayTotal = totalPrice || 0;

  return (
    <div className="grid md:grid-cols-2 gap-12 mt-6">
      {/* Left: Items */}
      <div>
        {displayItems.length > 0 ? (
          <div className="flex flex-col">
            {displayItems.map((item) => {
              const lineColor = getLineColor(item.product.line);
              return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="grid items-center py-4"
                  style={{
                    gridTemplateColumns: "52px 1fr auto",
                    gap: 14,
                    borderBottom: "1px solid rgba(138,206,0,0.06)",
                  }}
                >
                  {/* Swatch */}
                  <div
                    className="w-[52px] h-[52px] bg-ink-3 border border-dim relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage: `linear-gradient(45deg, ${lineColor}22 1px, transparent 1px)`,
                        backgroundSize: "8px 8px",
                      }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: lineColor }} />
                  </div>

                  {/* Info */}
                  <div>
                    <span className="font-display text-[16px] tracking-[0.06em] text-paper block">
                      {item.product.name}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.2em] text-muted uppercase block mt-0.5">
                      SIZE: {item.size} // QTY: {item.qty} // {item.product.ref}
                    </span>
                  </div>

                  {/* Price */}
                  <span className="font-display text-[18px] text-green">
                    {formatEUR(item.product.price * item.qty)}
                  </span>
                </div>
              );
            })}

            {/* Subtotal */}
            <div className="flex justify-between py-4" style={{ borderTop: "1px solid rgba(138,206,0,0.1)" }}>
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted">SUBTOTAL</span>
              <span className="font-display text-[22px] text-paper">{formatEUR(displayTotal)}</span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between py-3">
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted">SHIPPING</span>
              <span className="font-mono text-[11px] tracking-[0.1em] text-green uppercase">FREE</span>
            </div>

            {/* Total */}
            <div
              className="flex justify-between py-4"
              style={{ borderTop: "1px solid rgba(138,206,0,0.1)" }}
            >
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-paper">TOTAL</span>
              <span className="font-display text-[28px] text-green">{formatEUR(displayTotal)}</span>
            </div>

            {/* Artist contribution */}
            <div
              className="flex justify-between py-3 px-4 mt-2"
              style={{ background: "rgba(138,206,0,0.04)", border: "1px solid rgba(138,206,0,0.08)" }}
            >
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-green/70">
                10% ARTIST FUND ALLOCATION
              </span>
              <span className="font-display text-[16px] text-green">
                {formatEUR(artistContribution)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
              ORDER DATA WILL APPEAR HERE
            </span>
          </div>
        )}
      </div>

      {/* Right: Delivery details */}
      <div>
        <div className="bg-ink-3 p-6">
          <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-muted block mb-4">
            DELIVERY INFORMATION
          </span>

          {[
            { label: "METHOD", value: "STANDARD — 3-5 DAYS" },
            { label: "CARRIER", value: "DHL EXPRESS" },
            { label: "TRACKING", value: "SENT VIA EMAIL" },
            { label: "PACKAGING", value: "RECYCLED / ZERO PLASTIC" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(138,206,0,0.04)" }}>
              <span className="font-mono text-[8px] tracking-[0.25em] text-muted uppercase">{row.label}</span>
              <span className="font-mono text-[9px] tracking-[0.1em] text-paper uppercase">{row.value}</span>
            </div>
          ))}

          {/* Cert note */}
          <div
            className="flex justify-between py-2.5 mt-2"
            style={{ borderTop: "1px solid rgba(255,140,0,0.1)" }}
          >
            <span className="font-mono text-[8px] tracking-[0.25em] text-orange uppercase">CERTIFICATION</span>
            <span className="font-mono text-[9px] tracking-[0.1em] text-orange uppercase">
              KPT AUTHENTICITY CARD INCLUDED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
