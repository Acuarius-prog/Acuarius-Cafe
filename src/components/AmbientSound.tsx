"use client";
import { useEffect, useRef, useState } from "react";

/* Botón flotante de sonido ambiente (viento/olivar).
   - Apagado por defecto (los navegadores no permiten autoplay).
   - Al encender, sube el volumen suavemente (fade-in). Al apagar, baja (fade-out).
   - El archivo debe estar en /public/ambiente.mp3 */

export default function AmbientSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [available, setAvailable] = useState(true);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    const a = new Audio("/ambiente.mp3");
    a.loop = true;
    a.volume = 0;
    a.preload = "auto";
    a.addEventListener("error", () => setAvailable(false));
    audioRef.current = a;
    return () => { a.pause(); if (fadeRef.current) cancelAnimationFrame(fadeRef.current); };
  }, []);

  const fadeTo = (target: number, done?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const step = () => {
      if (!a) return;
      const diff = target - a.volume;
      if (Math.abs(diff) < 0.02) { a.volume = target; done?.(); return; }
      a.volume = Math.max(0, Math.min(1, a.volume + diff * 0.08));
      fadeRef.current = requestAnimationFrame(step);
    };
    step();
  };

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (!on) {
      try {
        await a.play();
        setOn(true);
        fadeTo(0.35);
      } catch {
        setAvailable(false);
      }
    } else {
      fadeTo(0, () => a.pause());
      setOn(false);
    }
  };

  if (!available) return null;

  return (
    <button
      className={"ambient-btn" + (on ? " on" : "")}
      onClick={toggle}
      aria-label={on ? "Silenciar sonido ambiente" : "Activar sonido ambiente"}
      title={on ? "Silenciar ambiente" : "Sonido ambiente"}
    >
      <span className="ambient-ico" aria-hidden="true">
        {on ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a9 9 0 0 1 0 14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        )}
      </span>
      {on && <span className="ambient-wave"><i></i><i></i><i></i></span>}
    </button>
  );
}
