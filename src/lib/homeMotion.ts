/** Home-only: smooth scroll cue + section fade-in (skipped when reduced motion). */

function initHeroScrollArrow(): void {
  const link = document.querySelector<HTMLAnchorElement>(".hero__scroll");
  const target = document.querySelector("#pricing");
  if (!link || !target) return;

  link.addEventListener("click", (e) => {
    e.preventDefault();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", "#pricing");
  });
}

function initSectionReveal(): void {
  if (!document.body.classList.contains("site-body--home")) return;

  const sections = document.querySelectorAll<HTMLElement>("main.site-main > section.section");
  if (sections.length === 0) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const reveal = (el: Element) => {
    el.classList.add("section--in-view");
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    },
    { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );

  for (const el of sections) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.top < vh * 0.88 && rect.bottom > 64) {
      reveal(el);
    } else {
      io.observe(el);
    }
  }
}

export function initHomeMotion(): void {
  initHeroScrollArrow();
  initSectionReveal();
}
