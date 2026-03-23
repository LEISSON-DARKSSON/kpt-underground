import { ScrollReveal } from "@/components/brand/scroll-reveal";

const MANIFESTO_ITEMS = [
  { text: "WE DO NOT ADVERTISE.", color: "text-paper" },
  { text: "WE DO NOT TREND.", color: "text-paper" },
  { text: "WE DO NOT FOLLOW.", color: "text-paper" },
  { text: "WE BUILD THE SYSTEMS.", color: "text-paper" },
  { text: "WE SUSTAIN THE ARTISTS.", color: "text-green" },
  { text: "WE KEEP THE FREQUENCY.", color: "text-paper" },
  { text: "WE KEEP THE STANDARD.", color: "text-orange" },
  { text: "WE KEEP IT UNDERGROUND.", color: "text-green" },
];

export function StoryManifesto() {
  return (
    <section className="py-32 border-t border-dim relative overflow-hidden">
      {/* Background text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[clamp(6rem,20vw,16rem)] text-dim/20 whitespace-nowrap">
          UNDERGROUND
        </span>
      </div>

      <div className="wrap relative" style={{ zIndex: 1 }}>
        <div className="max-w-[700px] mx-auto space-y-4">
          {MANIFESTO_ITEMS.map((item, i) => (
            <ScrollReveal key={item.text} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <p className={`font-display text-[clamp(1.5rem,4vw,3rem)] leading-[1.1] ${item.color}`}>
                {item.text}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
