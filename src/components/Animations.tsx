"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // 1) Scroll reveal en secciones y tarjetas
    const selectors = [
      ".section-head", ".hero-copy", ".hero-visual", ".ms-card", ".tienda-card",
      ".lvl", ".reserva-form", ".reserva-intro", ".flow-card", ".menu-hero-cream .wrap > *",
      ".cat-card", ".cat-chip", ".menu-item", ".visit-card", ".foot-col",
    ];
    const els = Array.from(document.querySelectorAll(selectors.join(",")));
    els.forEach((el, i) => {
      el.classList.add("reveal");
      (el as HTMLElement).style.setProperty("--reveal-delay", (i % 6) * 70 + "ms");
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("reveal--in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));

    // 2) Glow que sigue el cursor sobre el logo del hero
    const ring = document.querySelector(".ring") as HTMLElement | null;
    const onMove = (ev: MouseEvent) => {
      if (!ring) return;
      const r = ring.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      ring.style.setProperty("--gx", x + "%");
      ring.style.setProperty("--gy", y + "%");
    };
    const heroVisual = document.querySelector(".hero-visual");
    heroVisual?.addEventListener("mousemove", onMove as EventListener);

    return () => { io.disconnect(); heroVisual?.removeEventListener("mousemove", onMove as EventListener); };
  }, []);

  return null;
}
