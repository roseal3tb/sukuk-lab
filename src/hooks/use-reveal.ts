import { useEffect } from "react";

/** Animate once when content enters view; content is NEVER hidden by default. */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!elements.length) return;

    const animateEntry = (element: HTMLElement) => {
      if (element.dataset.slAnimated === "true") return;
      element.dataset.slAnimated = "true";
      if (typeof element.animate !== "function") return;

      const isCard = element.matches(".sl-experience-card, .sl-goals-card, .sl-logo-card, .sl-journey__day, .sl-tag, .sl-footer__identity, .sl-footer__links, .sl-footer__right");
      const siblings = Array.from(element.parentElement?.children ?? []).filter(
        (sibling) => sibling.classList.contains("reveal"),
      );
      const position = Math.max(0, siblings.indexOf(element));
      const delay = isCard ? Math.min(position, 4) * 125 : 0;

      try {
        // Backwards fill applies only during the entrance delay. The finished
        // animation leaves no persistent opacity/transform, so hover stays smooth.
        element.animate(
          [
            {
              opacity: 0.04,
              transform: isCard ? "translateY(48px) scale(.96)" : "translateY(28px)",
              filter: "blur(5px)",
            },
            { opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)" },
          ],
          {
            duration: isCard ? 920 : 780,
            delay,
            easing: "cubic-bezier(.22, 1, .36, 1)",
            fill: "backwards",
          },
        );
      } catch {
        // Unsupported animations are always readable.
      }
    };

    // Do not animate items already in the first viewport on initial load.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateEntry(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -6% 0px" },
    );

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        element.dataset.slAnimated = "true";
      } else if (rect.bottom < 0) {
        // Keep items visible when returning to an earlier section.
        element.dataset.slAnimated = "true";
      } else {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);
}
