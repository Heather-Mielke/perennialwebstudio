/** Path/hash matching for header + footer nav (SSR + client). */

export function normalizePathname(p: string): string {
  let path = p;
  if (!path || path === "/") return "/";
  if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
  return path || "/";
}

export function parseNavHref(href: string): { path: string; hash: string | null } {
  const i = href.indexOf("#");
  if (i === -1) {
    return { path: normalizePathname(href || "/"), hash: null };
  }
  const pathPart = href.slice(0, i) || "/";
  return { path: normalizePathname(pathPart), hash: href.slice(i) };
}

export function isNavLinkCurrent(
  href: string,
  ctx: { pathname: string; hash: string; homeSectionId: string | null },
): boolean {
  const { path, hash } = parseNavHref(href);
  const pn = normalizePathname(ctx.pathname);

  if (hash) {
    if (path !== "/" || pn !== "/") return false;
    const hf = hash.toLowerCase();
    const pricingScrollIds = ["pricing", "compare"];
    if (hf === "#pricing") {
      const ch = ctx.hash.toLowerCase();
      if (ctx.hash && (ch === "#pricing" || ch === "#compare")) return true;
      if (ctx.homeSectionId && pricingScrollIds.includes(ctx.homeSectionId)) return true;
    }
    if (hf === "#care-plans") {
      if (ctx.hash && ctx.hash.toLowerCase() === "#care-plans") return true;
      if (ctx.homeSectionId === "care-plans") return true;
    }
    if (ctx.hash) {
      return ctx.hash.toLowerCase() === hf;
    }
    if (ctx.homeSectionId) {
      return hash === `#${ctx.homeSectionId}`;
    }
    return false;
  }

  /** Home: active on `/` only when no hash and not scrolled into a home section (hero / top). */
  if (!hash && path === "/") {
    if (pn !== "/") return false;
    if (ctx.hash) return false;
    if (ctx.homeSectionId) return false;
    return true;
  }

  return pn === path;
}

/** Which home section is “current” by scroll (no hash in URL). */
export function getHomeActiveSectionId(): string | null {
  if (typeof window === "undefined") return null;
  if (normalizePathname(window.location.pathname) !== "/") return null;

  const ids = ["pricing", "compare", "care-plans", "contact"];
  const triggerLine = 108;
  let current: string | null = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= triggerLine) current = id;
  }
  return current;
}

function setLinkCurrent(link: HTMLAnchorElement, current: boolean): void {
  const href = link.getAttribute("data-nav-href") || link.getAttribute("href") || "";
  const { hash } = parseNavHref(href);

  link.classList.toggle("site-nav-link--current", current);

  if (!current) {
    link.removeAttribute("aria-current");
    return;
  }
  link.setAttribute("aria-current", hash ? "true" : "page");
}

export function updateNavCurrentStates(): void {
  const pathname = window.location.pathname;
  const hash = window.location.hash || "";
  const homeSectionId = hash ? null : getHomeActiveSectionId();
  const ctx = { pathname, hash, homeSectionId };

  document.querySelectorAll<HTMLAnchorElement>("a[data-nav-href]").forEach((link) => {
    const href = link.getAttribute("data-nav-href") || "";
    setLinkCurrent(link, isNavLinkCurrent(href, ctx));
  });
}

let scrollPending = false;

export function initNavCurrent(): void {
  updateNavCurrentStates();

  window.addEventListener("hashchange", updateNavCurrentStates);

  window.addEventListener(
    "scroll",
    () => {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        if (!window.location.hash) updateNavCurrentStates();
      });
    },
    { passive: true },
  );
}
