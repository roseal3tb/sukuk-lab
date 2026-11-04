import { useEffect } from "react";
import "@/styles-improvements.css";

/** Animate each section once on entry, without hiding content if JS is unavailable. */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add("is-visible");
          observer.unobserve(element);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    document.documentElement.classList.add("sl-motion");

    // Reveal anything already on screen; never leave content hidden after an observer issue.
    const fallback = window.setTimeout(() => {
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
          element.classList.add("is-visible");
        }
      });
    }, 1800);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
      document.documentElement.classList.remove("sl-motion");
    };
  }, []);
}
