import type { Metadata, Viewport } from "next";
import { Space_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { CursorEngine } from "@/components/brand/cursor-engine";
import { PageLoader } from "@/components/brand/page-loader";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/store/cart";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KEEP IT UNDERGROUND — Desk mats, prints & wear for people who build",
    template: "%s — KEEP IT UNDERGROUND",
  },
  description:
    "For the people who build, work and create: original graphic desk mats, notebooks, mugs, wall prints, tees, hoodies and totes. Made to order, secure checkout by Fourthwall.",
  metadataBase: new URL("https://keepitunderground.com"),
  openGraph: {
    title: "KEEP IT UNDERGROUND",
    description: "Original graphic objects for the spaces where you build, work and create.",
    siteName: "KPT Underground",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${bebasNeue.variable}`}>
      <body>
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-green focus:text-ink focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:tracking-widest focus:uppercase focus:no-underline"
          >
            Skip to content
          </a>
          <PageLoader />
          <CursorEngine />
          <Navbar />
          <main id="main-content" className="relative" style={{ zIndex: 1 }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
