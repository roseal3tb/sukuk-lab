
import { useLayoutEffect } from "react";

/**
 * SUKUK LAB scroll reveal:
 * - Content stays visible without JavaScript.
 * - Only elements below the viewport start hidden.
 * - Each element reveals once.
 * - Hover transforms remain independent.
 */
export function useReveal() {
  useLayoutEffect(() => {
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const root = document.documentElement;

    // Disable the previous conflicting animation system.
    root.classList.remove("sl-motion");

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );

    if (!elements.length) return;

    const pending: HTMLElement[] = [];

    // Prepare offscreen elements before enabling CSS animations.
    for (const element of elements) {
      element.classList.remove("sl-pending");

      const bounds = element.getBoundingClientRect();

      if (
        bounds.top > window.innerHeight + 16 &&
        !element.classList.contains("is-visible")
      ) {
        element.classList.add("sl-pending");
        pending.push(element);
      } else {
        element.classList.add("is-visible");
      }
    }

    if (!pending.length) return;

    root.classList.add("sl-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const element = entry.target as HTMLElement;

          observer.unobserve(element);

          // Reveal once and keep visible.
          element.classList.add("is-visible");
          element.classList.remove("sl-pending");
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    pending.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      root.classList.remove("sl-reveal-ready");

      pending.forEach((element) => {
        element.classList.remove("sl-pending");
      });
    };
  }, []);
}
