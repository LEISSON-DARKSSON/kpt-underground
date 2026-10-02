import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchase } from "@/components/store/product-purchase";
import { getProduct } from "@/lib/store/fourthwall";
import { displayName, categoryOf } from "@/lib/store/merchandising";
import { productJsonLd } from "@/lib/store/seo";

import type { Metadata } from "next";

export const revalidate = 60;

const SITE = "https://keepitunderground.com";

/**
 * Error contract (KPT-03): a product Fourthwall says does not exist / is not public → 404.
 * Fourthwall unreachable or malformed → the error is rethrown to ./error.tsx (temporary failure
 * with retry); it is never turned into a fake "not found".
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Throws StoreUnavailableError on upstream failure → real 5xx + ./error.tsx (never a soft 200/404).
  const product = await getProduct(slug);
  if (!product) notFound(); // decided here, before streaming starts (htmlLimitedBots) → real HTTP 404
  const text = product.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    title: product.name,
    description: text.slice(0, 155),
    alternates: { canonical: `${SITE}/shop/${product.slug}` },
    openGraph: { title: product.name, url: `${SITE}/shop/${product.slug}`, images: product.images[0] ? [{ url: product.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug); // throws StoreUnavailableError → error.tsx
  if (!product) notFound();
  const category = categoryOf(product.id);
  const details = product.sections.filter((s) => s.type !== "SIZE_AND_FIT");
  return (
    <article className="wrap pb-32" style={{ paddingTop: "calc(110px + var(--sat))" }} data-product-id={product.id}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product, SITE) }} />
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] text-slate">
        <Link href="/shop" data-cursor="h" className="text-green no-underline hover:underline">Shop</Link>
        {category && (
          <>
            {" / "}
            <Link href={`/shop?category=${category.key}`} data-cursor="h" className="text-green no-underline hover:underline">{category.label}</Link>
          </>
        )}
        {" / "}
        <span aria-current="page">{displayName(product.name)}</span>
      </nav>
      <ProductPurchase
        product={product}
        header={
          <>
            <p className="eyebrow">{category ? category.label : "KEEP IT UNDERGROUND"}</p>
            <h1 className="mt-4 font-display text-[clamp(44px,5.5vw,84px)] leading-[0.9] text-paper">{product.name}</h1>
          </>
        }
        details={
          <div className="mt-10 space-y-6 border-t border-dim pt-6" data-product-details>
            <div
              className="kiu-description space-y-3 font-mono text-xs leading-relaxed text-slate [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-paper"
              // Sanitized with an allow-list in normalizeProduct (p/ul/ol/li/strong/em/br, no attributes).
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
            {details.map((s) => (
              <section key={s.title} data-section={s.type} className="font-mono text-xs leading-relaxed text-slate">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">{s.title}</h2>
                <div className="mt-3 space-y-2 [&_li]:ml-4 [&_li]:list-disc [&_b]:text-paper [&_strong]:text-paper" dangerouslySetInnerHTML={{ __html: s.html }} />
              </section>
            ))}
          </div>
        }
      />
    </article>
  );
}
