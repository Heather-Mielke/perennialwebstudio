export type WebsitePlan = {
  name: string;
  price: string;
  note: string;
  /** Short intro (grey body) above the feature list */
  description: string;
  items: string[];
  featured?: boolean;
  badge?: string;
};

export type CarePlan = {
  name: string;
  /** Large amount only, e.g. "$95" */
  priceAmount: string;
  /** e.g. "/month" */
  pricePeriod: string;
  /** Short grey line under the title */
  tagline: string;
  /** Intro paragraph above the feature list */
  description: string;
  items: string[];
  featured?: boolean;
  badge?: string;
};

export const websitePlans: WebsitePlan[] = [
  {
    name: "Seedling",
    price: "$1,250",
    note: "Perfect for getting started",
    description:
      "A clean, single-page website to establish your online presence. Ideal for new businesses, freelancers, and solo entrepreneurs.",
    items: [
      "One focused landing-style page",
      "Best for businesses that need services, contact details, hours, and location in one place",
      "Mobile-friendly custom layout built from shared studio components",
      "Basic on-page search engine setup",
      "Contact section and inquiry form setup",
      "One round of revisions after first review",
      "Static marketing site only",
    ],
  },
  {
    name: "Evergreen",
    price: "$2,000",
    note: "Most popular choice",
    description:
      "A multi-page website with everything a growing business needs. Professional, polished, and built for credibility.",
    items: [
      "Up to 5 pages such as Home, About, Services, Contact, and Location",
      "Best for small businesses that need a fuller website with room for trust-building content",
      "Component-based layout tailored to your business and content",
      "Mobile-friendly design across all included pages",
      "Basic on-page search engine setup across the site",
      "Contact form setup and launch support",
      "Up to two rounds of revisions after first review",
      "Static marketing site only",
    ],
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Canopy",
    price: "$2,850",
    note: "The full experience",
    description:
      "A premium, fully custom website for businesses that want to stand out. Every detail is tailored to your brand.",
    items: [
      "Up to 7 pages for added services, FAQs, galleries, or location-specific content",
      "Best for businesses that need more room for content while staying simple and easy to manage",
      "Organized site structure and content layout guidance",
      "Mobile-friendly design across all included pages",
      "Basic analytics setup",
      "Basic on-page search engine setup across the site",
      "Up to two rounds of revisions after first review",
      "Static marketing site only",
    ],
  },
];

export const carePlans: CarePlan[] = [
  {
    name: "Sprout Care",
    priceAmount: "$95",
    pricePeriod: "/month",
    tagline: "Essential maintenance",
    description:
      "Ideal for businesses that need their site kept healthy with small updates and tweaks. About 30 minutes of hands-on work per month.",
    items: [
      "~30 min of maintenance per month",
      "Monthly security & software updates",
      "Up to 2 small text or image changes",
      "Uptime monitoring",
      "Monthly performance check",
      "Email support (48hr response)",
    ],
  },
  {
    name: "Growth Care",
    priceAmount: "$165",
    pricePeriod: "/month",
    tagline: "Active support",
    description:
      "For businesses that want regular content updates and hands-on attention. Up to 1–2 hours of dedicated work per month.",
    items: [
      "Up to 2 hours of maintenance per month",
      "Everything in Sprout Care",
      "Up to 5 content updates per month",
      "Add new sections or minor pages",
      "SEO monitoring & recommendations",
      "Priority email support (24hr response)",
      "Monthly analytics report",
    ],
    featured: true,
    badge: "Recommended",
  },
];

/** Contact form — “Interested in” dropdown (matches site packages & care plans). */
export const contactInterestedOptions = [
  "Seedling – From $1,250",
  "Evergreen – From $2,000",
  "Canopy – From $2,850",
  "Sprout Care – $95/mo",
  "Growth Care – $165/mo",
  "Not Sure",
] as const;

/** Cell: true = check, false = —, string = show text */
export type CompareCell = boolean | string;

export type BuildComparisonRow = {
  feature: string;
  seedling: CompareCell;
  evergreen: CompareCell;
  canopy: CompareCell;
};

export const buildComparisonRows: BuildComparisonRow[] = [
  {
    feature: "Custom responsive layout",
    seedling: true,
    evergreen: true,
    canopy: true,
  },
  {
    feature: "Mobile-friendly design",
    seedling: true,
    evergreen: true,
    canopy: true,
  },
  {
    feature: "Contact form",
    seedling: true,
    evergreen: true,
    canopy: true,
  },
  {
    feature: "Basic on-page SEO setup",
    seedling: true,
    evergreen: true,
    canopy: true,
  },
  {
    feature: "Pages included",
    seedling: "1 landing page",
    evergreen: "Up to 5",
    canopy: "Up to 7",
  },
  {
    feature: "Launch & form setup support",
    seedling: true,
    evergreen: true,
    canopy: true,
  },
  {
    feature: "Revision rounds after first review",
    seedling: "1",
    evergreen: "2",
    canopy: "2",
  },
  {
    feature: "Basic analytics setup",
    seedling: false,
    evergreen: false,
    canopy: true,
  },
  {
    feature: "Static marketing site (no storefront / logins)",
    seedling: true,
    evergreen: true,
    canopy: true,
  },
];
