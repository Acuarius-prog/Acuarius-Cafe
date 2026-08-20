"use client";

/* Ramas de olivo realistas que suben por los bordes y se curvan hacia adentro.
   Hojas con volumen (dos tonos + vena central), aceitunas con brillo.
   Se dibujan al cargar (la rama crece) y las hojas aparecen y se mecen. */

type LeafProps = { x: number; y: number; len: number; rot: number; delay: number; flip?: boolean };

function OliveLeaf({ x, y, len, rot, delay, flip }: LeafProps) {
  const w = len * 0.34;
  return (
    <g className="ol-leaf" style={{ ["--d" as string]: `${delay}s`, transformOrigin: `${x}px ${y}px` }}>
      <g transform={`rotate(${rot} ${x} ${y}) ${flip ? `scale(-1,1) translate(${-2 * x} 0)` : ""}`}>
        <path d={`M${x},${y} C${x + w},${y - len * 0.28} ${x + w},${y - len * 0.72} ${x},${y - len} C${x - w},${y - len * 0.72} ${x - w},${y - len * 0.28} ${x},${y}Z`} fill="url(#olLeafDark)" />
        <path d={`M${x},${y - len * 0.04} C${x + w * 0.82},${y - len * 0.3} ${x + w * 0.82},${y - len * 0.7} ${x},${y - len * 0.96} C${x - w * 0.5},${y - len * 0.7} ${x - w * 0.5},${y - len * 0.3} ${x},${y - len * 0.04}Z`} fill="url(#olLeafLight)" />
        <path d={`M${x},${y - len * 0.06} L${x},${y - len * 0.92}`} stroke="#2f5527" strokeWidth={len * 0.02} fill="none" opacity=".5" />
      </g>
    </g>
  );
}

function Olive({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g className="ol-olive" style={{ ["--d" as string]: `${delay}s`, transformOrigin: `${x}px ${y}px` }}>
      <ellipse cx={x} cy={y} rx="9" ry="12" fill="url(#olFruit)" transform={`rotate(18 ${x} ${y})`} />
      <ellipse cx={x - 2.5} cy={y - 4} rx="2.6" ry="3.4" fill="#f2f7e2" opacity=".65" transform={`rotate(18 ${x} ${y})`} />
    </g>
  );
}

const Defs = () => (
  <defs>
    <linearGradient id="olLeafDark" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#2f5a27" />
      <stop offset="1" stopColor="#3f7a34" />
    </linearGradient>
    <linearGradient id="olLeafLight" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#4e8f3c" />
      <stop offset="1" stopColor="#7bb85a" />
    </linearGradient>
    <radialGradient id="olFruit" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#a9c94b" />
      <stop offset="0.6" stopColor="#7ba62f" />
      <stop offset="1" stopColor="#5c7f22" />
    </radialGradient>
  </defs>
);

function BranchLeft() {
  const stem = "M12,940 C40,760 -10,600 40,440 C80,300 30,170 120,70";
  const leaves: LeafProps[] = [
    { x: 30, y: 860, len: 62, rot: -40, delay: 0.6 },
    { x: 20, y: 800, len: 54, rot: 25, delay: 0.75, flip: true },
    { x: 34, y: 740, len: 64, rot: -50, delay: 0.9 },
    { x: 16, y: 680, len: 54, rot: 20, delay: 1.05, flip: true },
    { x: 40, y: 620, len: 66, rot: -55, delay: 1.2 },
    { x: 24, y: 560, len: 56, rot: 15, delay: 1.35, flip: true },
    { x: 34, y: 500, len: 64, rot: -48, delay: 1.5 },
    { x: 30, y: 440, len: 58, rot: 22, delay: 1.65, flip: true },
    { x: 48, y: 380, len: 66, rot: -58, delay: 1.8 },
    { x: 46, y: 320, len: 58, rot: 8, delay: 1.95, flip: true },
    { x: 66, y: 250, len: 64, rot: -62, delay: 2.1 },
    { x: 74, y: 185, len: 58, rot: 2, delay: 2.25, flip: true },
    { x: 96, y: 120, len: 62, rot: -68, delay: 2.4 },
    { x: 112, y: 78, len: 56, rot: -20, delay: 2.55 },
  ];
  const olives = [{ x: 30, y: 690, delay: 1.6 }, { x: 40, y: 470, delay: 2.0 }, { x: 78, y: 220, delay: 2.5 }];
  return (
    <svg className="olive-branch ob-left" viewBox="0 0 160 960" preserveAspectRatio="xMinYMax slice" aria-hidden="true">
      <Defs />
      <path className="ob-stem" d={stem} />
      {leaves.map((l, i) => <OliveLeaf key={i} {...l} />)}
      {olives.map((o, i) => <Olive key={"o" + i} {...o} />)}
    </svg>
  );
}

function BranchRight() {
  const stem = "M148,940 C120,760 170,600 120,440 C80,300 130,170 40,70";
  const leaves: LeafProps[] = [
    { x: 130, y: 860, len: 62, rot: 40, delay: 0.65 },
    { x: 140, y: 800, len: 54, rot: -25, delay: 0.8 },
    { x: 126, y: 740, len: 64, rot: 50, delay: 0.95 },
    { x: 144, y: 680, len: 54, rot: -20, delay: 1.1 },
    { x: 120, y: 620, len: 66, rot: 55, delay: 1.25 },
    { x: 136, y: 560, len: 56, rot: -15, delay: 1.4 },
    { x: 126, y: 500, len: 64, rot: 48, delay: 1.55 },
    { x: 130, y: 440, len: 58, rot: -22, delay: 1.7 },
    { x: 112, y: 380, len: 66, rot: 58, delay: 1.85 },
    { x: 114, y: 320, len: 58, rot: -8, delay: 2.0 },
    { x: 94, y: 250, len: 64, rot: 62, delay: 2.15 },
    { x: 86, y: 185, len: 58, rot: -2, delay: 2.3 },
    { x: 64, y: 120, len: 62, rot: 68, delay: 2.45 },
    { x: 48, y: 78, len: 56, rot: 20, delay: 2.6 },
  ];
  const olives = [{ x: 130, y: 690, delay: 1.65 }, { x: 120, y: 470, delay: 2.05 }, { x: 82, y: 220, delay: 2.55 }];
  return (
    <svg className="olive-branch ob-right" viewBox="0 0 160 960" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
      <Defs />
      <path className="ob-stem" d={stem} />
      {leaves.map((l, i) => <OliveLeaf key={i} {...l} />)}
      {olives.map((o, i) => <Olive key={"o" + i} {...o} />)}
    </svg>
  );
}

export default function Vines() {
  return (
    <div className="vines-wrap" aria-hidden="true">
      <BranchLeft />
      <BranchRight />
    </div>
  );
}
