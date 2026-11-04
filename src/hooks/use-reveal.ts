import { useEffect } from "react";

/** Each element reveals once. Anything not explicitly pending is always visible. */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!elements.length) return;

    const reveal = (element: HTMLElement) => {
      element.classList.add("is-visible");
      element.classList.remove("sl-pending");
    };

    // Elements already on screen are never hidden.
    const pending = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50 || rect.bottom < 0) {
        reveal(element);
        return false;
      }
      element.classList.add("sl-pending");
      return true;
    });

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        reveal(element);
        observer.unobserve(element);
      }
    }, { threshold: 0, rootMargin: "0px 0px 100px 0px" });

    pending.forEach((element) => observer.observe(element));
    document.documentElement.classList.add("sl-motion");

    // Scroll/resize fallback also handles tall cards and unusual observer timing.
    const check = () => {
      for (const element of pending) {
        if (!element.classList.contains("sl-pending")) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          reveal(element);
          observer.unobserve(element);
        }
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    // Absolute safety net: no section remains hidden after 5 seconds.
    const rescue = window.setTimeout(() => pending.forEach(reveal), 5000);

    return () => {
      window.clearTimeout(rescue);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("sl-pending"));
      document.documentElement.classList.remove("sl-motion");
    };
  }, []);
}
