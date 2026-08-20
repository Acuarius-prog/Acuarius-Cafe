"use client";

/* Marco decorativo de olivo para el hero: ramas realistas en las esquinas
   superiores e inferiores, con hojas de volumen y aceitunas sutiles. */

type LeafProps = { x: number; y: number; len: number; rot: number; delay: number; flip?: boolean };

function OliveLeaf({ x, y, len, rot, delay, flip }: LeafProps) {
  const w = len * 0.34;
  return (
    <g className="hf-leaf" style={{ ["--d" as string]: `${delay}s`, transformOrigin: `${x}px ${y}px` }}>
      <g transform={`rotate(${rot} ${x} ${y}) ${flip ? `scale(-1,1) translate(${-2 * x} 0)` : ""}`}>
        <path d={`M${x},${y} C${x + w},${y - len * 0.28} ${x + w},${y - len * 0.72} ${x},${y - len} C${x - w},${y - len * 0.72} ${x - w},${y - len * 0.28} ${x},${y}Z`} fill="url(#hfDark)" />
        <path d={`M${x},${y - len * 0.04} C${x + w * 0.82},${y - len * 0.3} ${x + w * 0.82},${y - len * 0.7} ${x},${y - len * 0.96} C${x - w * 0.5},${y - len * 0.7} ${x - w * 0.5},${y - len * 0.3} ${x},${y - len * 0.04}Z`} fill="url(#hfLight)" />
        <path d={`M${x},${y - len * 0.06} L${x},${y - len * 0.92}`} stroke="#2f5527" strokeWidth={len * 0.02} fill="none" opacity=".5" />
      </g>
    </g>
  );
}
function Olive({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g className="hf-olive" style={{ ["--d" as string]: `${delay}s`, transformOrigin: `${x}px ${y}px` }}>
      <ellipse cx={x} cy={y} rx="7" ry="9.5" fill="url(#hfFruit)" transform={`rotate(18 ${x} ${y})`} />
      <ellipse cx={x - 2} cy={y - 3} rx="2" ry="2.6" fill="#f2f7e2" opacity=".6" transform={`rotate(18 ${x} ${y})`} />
    </g>
  );
}
const Defs = () => (
  <defs>
    <linearGradient id="hfDark" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#2f5a27" /><stop offset="1" stopColor="#3f7a34" /></linearGradient>
    <linearGradient id="hfLight" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#4e8f3c" /><stop offset="1" stopColor="#7bb85a" /></linearGradient>
    <radialGradient id="hfFruit" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#a9c94b" /><stop offset="0.6" stopColor="#7ba62f" /><stop offset="1" stopColor="#5c7f22" /></radialGradient>
  </defs>
);

/* Rama de esquina reutilizable; se orienta con transform desde el CSS/props */
function CornerBranch({ variant }: { variant: "tl" | "tr" | "bl" | "br" }) {
  // rama base (esquina superior-izquierda), luego se refleja por CSS para las otras
  const stem = "M6,6 C70,14 130,10 210,26 M6,6 C14,70 10,130 26,210";
  const leaves: LeafProps[] = [
    { x: 70, y: 16, len: 30, rot: -70, delay: 0.5 },
    { x: 110, y: 14, len: 26, rot: -95, delay: 0.6, flip: true },
    { x: 150, y: 20, len: 30, rot: -70, delay: 0.7 },
    { x: 190, y: 26, len: 26, rot: -100, delay: 0.8, flip: true },
    { x: 16, y: 70, len: 30, rot: -20, delay: 0.55 },
    { x: 14, y: 110, len: 26, rot: 5, delay: 0.65, flip: true },
    { x: 20, y: 150, len: 30, rot: -20, delay: 0.75 },
    { x: 26, y: 190, len: 26, rot: 8, delay: 0.85, flip: true },
  ];
  const olives = [{ x: 130, y: 12, delay: 0.9 }, { x: 12, y: 130, delay: 0.95 }];
  return (
    <svg className={"hf-corner hf-" + variant} viewBox="0 0 230 230" aria-hidden="true">
      <Defs />
      <path className="hf-stem" d={stem} />
      {leaves.map((l, i) => <OliveLeaf key={i} {...l} />)}
      {olives.map((o, i) => <Olive key={"o" + i} {...o} />)}
    </svg>
  );
}

export default function HeroFrame() {
  return (
    <div className="hero-frame" aria-hidden="true">
      <CornerBranch variant="tl" />
      <CornerBranch variant="tr" />
      <CornerBranch variant="bl" />
      <CornerBranch variant="br" />
    </div>
  );
}
