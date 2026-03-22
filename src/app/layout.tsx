import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Space_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { CursorEngine } from "@/components/brand/cursor-engine";
import { AudioToggle } from "@/components/brand/audio-toggle";
import { PageLoader } from "@/components/brand/page-loader";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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
    default: "KEEP IT UNDERGROUND — Soundsystem Workwear",
    template: "%s — KPT UNDERGROUND",
  },
  description:
    "Soundsystem workwear for the people who build the systems. Equipment engineered for the underground.",
  metadataBase: new URL("https://keepitunderground.com"),
  openGraph: {
    title: "KEEP IT UNDERGROUND",
    description: "Soundsystem workwear for the people who build the systems.",
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
        <PageLoader />
        <CursorEngine />
        <Navbar />
        <main className="relative" style={{ zIndex: 1 }}>
          {children}
        </main>
        <Footer />
        <AudioToggle />
      </body>
    </html>
  );
}
