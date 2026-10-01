import { notFound } from "next/navigation";

import { PreviewCartProvider } from "@/components/commerce/preview-cart";
import { PreviewToolbar } from "@/components/commerce/preview-toolbar";
import { commercePreviewEnabled } from "@/lib/commerce/gate";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desk mats — design preview",
  robots: { index: false, follow: false, nocache: true },
};

/** Gated segment: React port of the commerce design. 404 on Production / unknown hosts. */
export default function CommercePreviewShopLayout({ children }: { children: React.ReactNode }) {
  if (!commercePreviewEnabled()) notFound();
  return (
    <PreviewCartProvider>
      <div className="kiu-commerce" style={{ paddingTop: "calc(56px + var(--sat))" }}>
        <PreviewToolbar />
        {children}
      </div>
    </PreviewCartProvider>
  );
}
