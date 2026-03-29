/** Header: no Contact (Get a Quote → /#contact); no /components (Examples in footer only). */
export const headerNav = [
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#pricing" },
] as const;

export const footerNav = [
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" },
  { label: "Examples", href: "/components" },
] as const;
