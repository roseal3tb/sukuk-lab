import { useLayoutEffect } from "react";

/** Reveal only when entering viewport. Content stays visible if observers or JS are unavailable. */
export function useReveal() {
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!elements.length) return;

    // Hide before paint so elements below the fold don't flash visible first.
    document.documentElement.classList.add("sl-motion");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-visible");
        observer.unobserve(el);
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -85px 0px" });

    elements.forEach((el) => observer.observe(el));
    // If observer is blocked or delayed, do not leave the page inaccessible.
    const rescue = window.setTimeout(() => {
      elements.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0) {
          el.classList.add("is-visible");
        }
      });
    }, 3000);
    return () => {
      window.clearTimeout(rescue);
      observer.disconnect();
      document.documentElement.classList.remove("sl-motion");
    };
  }, []);
}
