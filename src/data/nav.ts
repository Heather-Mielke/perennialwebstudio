/** Header: no Contact (Get a Quote → /#contact); no /components (Examples in footer only). */
export const headerNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Care Plans", href: "/#care-plans" },
] as const;

export const footerNav = [
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Care Plans", href: "/#care-plans" },
  { label: "Contact", href: "/#contact" },
  { label: "Examples", href: "/components" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;
