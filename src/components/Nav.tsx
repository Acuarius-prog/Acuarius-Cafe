"use client";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="wrap nav-inner">
        <a className="brand brand-lg" href="#top" aria-label="Acuarius Café y Sabores, inicio">
          <span className="mark">Acuarius</span>
          <span className="sub">Café &amp; Sabores</span>
        </a>
        <nav className={"nav-links" + (open ? " open" : "")} aria-label="Principal">
          <a href="#menu" onClick={close}>Menú</a>
          <a href="#flowmatch" onClick={close}>Flow Match</a>
          <a href="#programa" onClick={close}>Programa Flow</a>
          <a href="/flow" onClick={close}>Mi Flow</a>
          <a href="#tienda" onClick={close}>Tienda</a>
          <a href="#visitanos" onClick={close}>Visítanos</a>
        </nav>
        <div className="nav-cta">
          <a href="#reservas" className="btn btn-ghost">Reservar</a>
          <a href="#menu" className="btn btn-primary">Ver el menú</a>
          <button
            className="burger"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
