/** Live Fourthwall policy/contact pages for this shop (read 2026-10-02). The site links; it does not restate legal terms. */
export const SHOP_PAGES = "https://keepitunderground-shop.fourthwall.com";

export const POLICY_LINKS = [
  { href: `${SHOP_PAGES}/pages/returns-faq`, label: "Returns & FAQ" },
  { href: `${SHOP_PAGES}/pages/terms-of-service`, label: "Terms of service" },
  { href: `${SHOP_PAGES}/pages/privacy-policy`, label: "Privacy policy" },
  { href: `${SHOP_PAGES}/contact`, label: "Contact" },
] as const;

export const CONTACT_URL = `${SHOP_PAGES}/contact`;
