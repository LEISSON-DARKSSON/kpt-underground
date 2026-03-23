import { ScrollReveal } from "@/components/brand/scroll-reveal";
import type { ArtistProfile } from "@/lib/artists";
import { formatFundAmount } from "@/lib/artists";

interface ArtistGridProps {
  artists: ArtistProfile[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <section className="py-32 border-t border-dim">
      <div className="wrap">
        <ScrollReveal>
          <span className="eyebrow">CURRENT RECIPIENTS // {artists.length} ARTISTS</span>
        </ScrollReveal>

        <div className="mt-12 space-y-0">
          {artists.map((artist, i) => (
            <ScrollReveal key={artist.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div className="border-t border-dim py-8 grid md:grid-cols-[1fr_200px_120px] gap-6 items-start">
                <div>
                  <h3 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-none text-paper">
                    {artist.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-green">
                      {artist.scene}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                      {artist.location}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                      {artist.frequency}
                    </span>
                  </div>
                  <p className="text-paper/60 leading-relaxed mt-3 max-w-[500px]">
                    {artist.bio}
                  </p>
                </div>

                <div className="md:text-right">
                  <span className="font-display text-2xl text-green">
                    {formatFundAmount(artist.fundAmount)}
                  </span>
                  <span className="block font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-1">
                    DISTRIBUTED
                  </span>
                </div>

                <div className="md:text-right">
                  <span className="inline-block font-mono text-[10px] tracking-[0.14em] uppercase text-green border border-green/20 px-3 py-1">
                    ACTIVE
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
