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
  const onHome = pn === "/";

  if (hash) {
    if (path !== "/" || !onHome) return false;
    const hf = hash.toLowerCase();
    const pricingScrollIds = ["pricing", "compare"];
    const hs = (ctx.homeSectionId || "").toLowerCase();

    // On the homepage, follow the section currently in view (scroll spy),
    // rather than locking to the last clicked hash in the URL.
    if (hs) {
      if (hf === "#pricing") return pricingScrollIds.includes(hs);
      return hf === `#${hs}`;
    }

    // Hero / top of home: no active section hashes.
    return false;

    /* Legacy hash-based matching (kept unreachable intentionally)
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
    */
  }

  /** Home: active on `/` only when no hash and not scrolled into a home section (hero / top). */
  if (!hash && path === "/") {
    if (!onHome) return false;
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

let pendingTargetId: string | null = null;
let pendingTargetUntil = 0;

function getPendingTargetFromHref(href: string): string | null {
  const { path, hash } = parseNavHref(href);
  if (path !== "/" || !hash) return null;
  const id = hash.slice(1).trim().toLowerCase();
  return id || null;
}

function isPendingTargetReached(targetId: string): boolean {
  const el = document.getElementById(targetId);
  if (!el) return true;
  return el.getBoundingClientRect().top <= 108;
}

export function updateNavCurrentStates(): void {
  const pathname = window.location.pathname;
  const hash = window.location.hash || "";
  let homeSectionId = getHomeActiveSectionId();

  if (normalizePathname(pathname) === "/" && pendingTargetId) {
    const expired = Date.now() > pendingTargetUntil;
    const reached = isPendingTargetReached(pendingTargetId);
    if (expired || reached) {
      pendingTargetId = null;
      pendingTargetUntil = 0;
    } else {
      homeSectionId = pendingTargetId;
    }
  } else if (pendingTargetId) {
    pendingTargetId = null;
    pendingTargetUntil = 0;
  }

  const ctx = { pathname, hash, homeSectionId };

  document.querySelectorAll<HTMLAnchorElement>("a[data-nav-href]").forEach((link) => {
    const href = link.getAttribute("data-nav-href") || "";
    setLinkCurrent(link, isNavLinkCurrent(href, ctx));
  });
}

let scrollPending = false;

export function initNavCurrent(): void {
  updateNavCurrentStates();

  document.querySelectorAll<HTMLAnchorElement>("a[data-nav-href]").forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("data-nav-href") || link.getAttribute("href") || "";
      const pending = getPendingTargetFromHref(href);
      if (!pending || normalizePathname(window.location.pathname) !== "/") return;
      pendingTargetId = pending;
      // Keep clicked link active while smooth-scrolling to target.
      pendingTargetUntil = Date.now() + 2500;
      updateNavCurrentStates();
    });
  });

  window.addEventListener("hashchange", updateNavCurrentStates);

  window.addEventListener(
    "scroll",
    () => {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        updateNavCurrentStates();
      });
    },
    { passive: true },
  );
}
