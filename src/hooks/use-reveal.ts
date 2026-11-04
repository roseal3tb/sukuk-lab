
import { useEffect } from "react";

/**
 * One-time, flicker-free scroll entrance for SUKUK LAB.
 * Content remains visible even if animations fail.
 */
export function useReveal() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const element = entry.target as HTMLElement;

          observer.unobserve(element);

          if (element.dataset.slAnimated === "true") {
            continue;
          }

          element.dataset.slAnimated = "true";

          if (typeof element.animate !== "function") {
            continue;
          }

          const isCard = element.matches(
            ".sl-experience-card, " +
            ".sl-goals-card, " +
            ".sl-logo-card, " +
            ".sl-journey__day"
          );

          try {
            element.animate(
              [
                {
                  opacity: 1,
                  transform: `translate3d(0, ${
                    isCard ? 18 : 12
                  }px, 0)`,
                },
                {
                  opacity: 1,
                  transform: "translate3d(0, 0, 0)",
                },
              ],
              {
                duration: isCard ? 560 : 470,
                delay: 0,
                easing:
                  "cubic-bezier(.22, 1, .36, 1)",
                fill: "none",
              }
            );
          } catch {
            // Keep content visible if animation fails.
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    for (const element of elements) {
      if (element.dataset.slAnimated === "true") {
        continue;
      }

      const rect = element.getBoundingClientRect();

      if (
        (rect.top < window.innerHeight &&
          rect.bottom > 0) ||
        rect.bottom <= 0
      ) {
        element.dataset.slAnimated = "true";
      } else {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);
}
