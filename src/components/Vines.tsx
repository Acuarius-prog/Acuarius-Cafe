"use client";

/* Enredaderas decorativas a ambos lados, inspiradas en las ramas de olivo del logo.
   Se dibujan solas al cargar (crecen) y las hojas se mecen suavemente. */

function Leaf({ cx, cy, r, rot, delay }: { cx: number; cy: number; r: number; rot: number; delay: number }) {
  return (
    <g className="vine-leaf" style={{ ["--d" as string]: `${delay}s` }}>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.42} transform={`rotate(${rot} ${cx} ${cy})`} />
    </g>
  );
}

function VineLeft() {
  return (
    <svg className="vine vine-left" viewBox="0 0 160 900" preserveAspectRatio="xMinYMin slice" aria-hidden="true">
      <path className="vine-stem" d="M20,-20 C70,120 10,240 60,380 C100,500 20,620 70,760 C95,840 60,900 40,940" />
      <g className="vine-leaves">
        <Leaf cx={44} cy={70} r={26} rot={-25} delay={0.5} />
        <Leaf cx={30} cy={130} r={22} rot={35} delay={0.7} />
        <Leaf cx={40} cy={210} r={28} rot={-20} delay={0.9} />
        <Leaf cx={22} cy={280} r={22} rot={40} delay={1.1} />
        <Leaf cx={55} cy={350} r={26} rot={-30} delay={1.3} />
        <Leaf cx={38} cy={430} r={24} rot={30} delay={1.5} />
        <Leaf cx={30} cy={510} r={27} rot={-22} delay={1.7} />
        <Leaf cx={55} cy={585} r={22} rot={38} delay={1.9} />
        <Leaf cx={40} cy={660} r={26} rot={-28} delay={2.1} />
        <Leaf cx={28} cy={740} r={23} rot={34} delay={2.3} />
        <Leaf cx={55} cy={810} r={25} rot={-24} delay={2.5} />
      </g>
    </svg>
  );
}

function VineRight() {
  return (
    <svg className="vine vine-right" viewBox="0 0 160 900" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
      <path className="vine-stem" d="M140,-20 C90,120 150,240 100,380 C60,500 140,620 90,760 C65,840 100,900 120,940" />
      <g className="vine-leaves">
        <Leaf cx={116} cy={70} r={26} rot={25} delay={0.6} />
        <Leaf cx={130} cy={130} r={22} rot={-35} delay={0.8} />
        <Leaf cx={120} cy={210} r={28} rot={20} delay={1.0} />
        <Leaf cx={138} cy={280} r={22} rot={-40} delay={1.2} />
        <Leaf cx={105} cy={350} r={26} rot={30} delay={1.4} />
        <Leaf cx={122} cy={430} r={24} rot={-30} delay={1.6} />
        <Leaf cx={130} cy={510} r={27} rot={22} delay={1.8} />
        <Leaf cx={105} cy={585} r={22} rot={-38} delay={2.0} />
        <Leaf cx={120} cy={660} r={26} rot={28} delay={2.2} />
        <Leaf cx={132} cy={740} r={23} rot={-34} delay={2.4} />
        <Leaf cx={105} cy={810} r={25} rot={24} delay={2.6} />
      </g>
    </svg>
  );
}

export default function Vines() {
  return (
    <div className="vines-wrap" aria-hidden="true">
      <VineLeft />
      <VineRight />
    </div>
  );
}
