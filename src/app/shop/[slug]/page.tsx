import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { ProductDetail } from "@/components/shop/product-detail";
import { ProductCard } from "@/components/shop/product-card";
import { PRODUCTS, getProductBySlug, getProductsByLine, formatEUR } from "@/lib/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not Found" };
  return {
    title: `${product.name} — ${product.line}`,
    description: `${product.name}. ${product.shortSpec}. ${formatEUR(product.price)}. Soundsystem workwear engineered for the underground.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getProductsByLine(product.line).filter((p) => p.id !== product.id);

  return (
    <>
      {/* ═══ PRODUCT DETAIL (full-bleed 2-col layout) ═══ */}
      <section style={{ paddingTop: 56 }}>
        <ProductDetail product={product} />
      </section>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["EQUIPMENT NOT FASHION", "440GSM FRENCH TERRY", "AQL 2.5 STANDARD", "SOUNDSYSTEM WORKWEAR"]}
        duration={35}
      />

      {/* ═══ RELATED ═══ */}
      {related.length > 0 && (
        <section className="py-24 border-t border-dim">
          <div className="wrap">
            <ScrollReveal>
              <span className="eyebrow">RELATED EQUIPMENT</span>
            </ScrollReveal>

            <div
              className="grid grid-cols-2 md:grid-cols-3 mt-8"
              style={{ gap: 2 }}
            >
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
