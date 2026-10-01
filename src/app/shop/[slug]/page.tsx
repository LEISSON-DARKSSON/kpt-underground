import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/store/add-to-cart";
import { ProductGallery } from "@/components/store/product-gallery";
import { getProduct } from "@/lib/store/fourthwall";

import type { Metadata } from "next";
import type { StoreProduct } from "@/lib/store/core";

export const revalidate = 60;

async function load(slug: string): Promise<StoreProduct | null> {
  try {
    return await getProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await load((await params).slug);
  if (!product) return { title: "Not found" };
  const text = product.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    title: product.name,
    description: text.slice(0, 155),
    openGraph: { title: product.name, images: product.images[0] ? [{ url: product.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await load((await params).slug);
  if (!product) notFound();
  return (
    <article className="wrap pb-32" style={{ paddingTop: "calc(110px + var(--sat))" }} data-product-id={product.id}>
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] text-slate">
        <Link href="/shop" data-cursor="h" className="text-green no-underline hover:underline">Shop</Link> / <span aria-current="page">{product.name}</span>
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />
        <div className="min-w-0">
          <p className="eyebrow">KEEP IT UNDERGROUND</p>
          <h1 className="mt-4 font-display text-[clamp(44px,5.5vw,84px)] leading-[0.9] text-paper">{product.name}</h1>
          <div className="mt-8">
            <AddToCart product={product} />
          </div>
          <div
            className="kiu-description mt-10 space-y-3 border-t border-dim pt-6 font-mono text-xs leading-relaxed text-slate [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-paper"
            // Sanitized with an allow-list in normalizeProduct (p/ul/ol/li/strong/em/br, no attributes).
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>
      </div>
    </article>
  );
}
