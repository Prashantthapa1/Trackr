"use client";

import { useEffect } from "react";

export function LandingNavEffects() {
  useEffect(() => {
    const nav = document.getElementById("landing-nav");
    if (!nav) return;

    const onScroll = () => {
      const isDark = document.documentElement.classList.contains("dark");

      if (window.scrollY > 40) {
        if (isDark) {
          nav.style.backgroundColor = "rgba(13, 31, 20, 0.85)";
          nav.style.borderColor = "rgba(74, 222, 128, 0.1)";
          nav.style.boxShadow = "0 1px 0 rgba(74, 222, 128, 0.1), 0 4px 24px rgba(0, 0, 0, 0.2)";
        } else {
          nav.style.backgroundColor = "rgba(247, 253, 249, 0.85)";
          nav.style.borderColor = "rgba(34, 197, 94, 0.12)";
          nav.style.boxShadow = "0 1px 0 rgba(34, 197, 94, 0.12), 0 4px 24px rgba(0, 0, 0, 0.04)";
        }
        nav.style.backdropFilter = "blur(16px) saturate(180%)";
        nav.classList.add("scrolled");
      } else {
        nav.style.backgroundColor = "transparent";
        nav.style.backdropFilter = "none";
        nav.style.borderColor = "transparent";
        nav.style.boxShadow = "none";
        nav.classList.remove("scrolled");
      }
    };

    // Scroll reveal observer
    const revealElements = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    revealElements.forEach((el) => {
      el.classList.remove("revealed");
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // Initialize
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Observer for theme changes
    const themeObserver = new MutationObserver(() => {
      onScroll();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return null;
}
