import { useEffect } from "react";

/**
 * Progressive enhancement only: content is visible without JS or IntersectionObserver.
 * Animate once, subtly, as each element enters view; never hide cards while scrolling.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          if (element.dataset.revealed === "true") continue;
          element.dataset.revealed = "true";
          observer.unobserve(element);

          // Both keyframes are clearly visible. No dependency on the animation
          // completing for the element to be readable/clickable.
          if (typeof element.animate === "function") {
            element.animate(
              [
                { opacity: 0.94, transform: "translateY(10px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 490, easing: "cubic-bezier(.22,1,.36,1)", fill: "none" },
            );
          }
        }
      },
      { threshold: 0.04, rootMargin: "0px 0px 12% 0px" },
    );
    items.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}
