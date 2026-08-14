"use client";
import { useState } from "react";

type Q = { key: string; q: string; opts: { t: string; v: string }[] };

const QUESTIONS: Q[] = [
  { key: "momento", q: "¿En qué momento del día estás?", opts: [
    { t: "Mañana", v: "manana" }, { t: "Tarde", v: "tarde" },
    { t: "Noche", v: "noche" }, { t: "A cualquier hora", v: "any" } ] },
  { key: "animo", q: "¿Qué buscas ahora mismo?", opts: [
    { t: "Energía para arrancar", v: "energia" }, { t: "Relajarme", v: "relax" },
    { t: "Algo refrescante", v: "fresco" }, { t: "Ganas de celebrar", v: "celebrar" } ] },
  { key: "intensidad", q: "¿Qué intensidad prefieres?", opts: [
    { t: "Suave", v: "suave" }, { t: "Media", v: "media" },
    { t: "Intensa", v: "intensa" }, { t: "Me da igual", v: "any" } ] },
  { key: "perfil", q: "¿Cómo te gusta el sabor?", opts: [
    { t: "Dulce", v: "dulce" }, { t: "Equilibrado", v: "equilibrado" },
    { t: "Amargo", v: "amargo" }, { t: "Cítrico", v: "citrico" } ] },
  { key: "alcohol", q: "¿Con o sin alcohol?", opts: [
    { t: "Sin alcohol", v: "sin" }, { t: "Con alcohol", v: "con" },
    { t: "Sorpréndeme", v: "sorpresa" } ] },
];

const DRINKS: Record<string, { name: string; cat: string; desc: string; pair: string }> = {
  espresso: { name: "Espresso de origen", cat: "Café", desc: "Un shot intenso y trazable de nuestro grano de tueste medio. Puro carácter para arrancar el día.", pair: "una galleta de mantequilla" },
  coldbrew: { name: "Cold Brew de la casa", cat: "Café", desc: "12 horas de extracción en frío: suave, refrescante y con cafeína que rinde toda la tarde.", pair: "un brownie de la casa" },
  chai: { name: "Chai Latte especiado", cat: "Tés", desc: "Té negro con especias y leche vaporizada. Un abrazo tibio para bajar revoluciones.", pair: "un cheesecake de maracuyá" },
  matcha: { name: "Matcha frío", cat: "Tés", desc: "Matcha ceremonial batido sobre hielo. Energía calmada, verde y vibrante.", pair: "un dulce de temporada" },
  verde: { name: "Jugo Verde Detox", cat: "Jugos", desc: "Prensado en frío del día: apio, manzana verde, pepino y jengibre. Ligero y revitalizante.", pair: "una tostada de aguacate" },
  limonada: { name: "Limonada de coco & hierbabuena", cat: "Jugos", desc: "Cremosa, cítrica y muy refrescante. El antojo dulce sin culpa.", pair: "un postre cítrico" },
  mojito: { name: "Mojito de la casa", cat: "Cócteles", desc: "Ron, hierbabuena fresca y lima. Burbujeante y perfecto para brindar.", pair: "unas alitas de la barra" },
  gintonic: { name: "Gin Tónica botánica", cat: "Cócteles", desc: "Gin premium, tónica artesanal y un jardín de botánicos. Elegante y equilibrada.", pair: "una tabla de quesos" },
  ipa: { name: "IPA artesanal", cat: "Cerveza", desc: "Lupulada, amarga y aromática, de cervecería local. Para paladares que buscan intensidad.", pair: "una hamburguesa de la casa" },
  latte: { name: "Latte de la casa", cat: "Café", desc: "Espresso sedoso con leche vaporizada y arte de barista. El clásico que nunca falla.", pair: "una porción de torta de zanahoria" },
};

function recommend(a: Record<string, string>): string {
  const wantAlc = a.alcohol === "con" || (a.alcohol === "sorpresa" && a.animo === "celebrar");
  if (wantAlc) {
    if (a.animo === "fresco" || a.perfil === "citrico") return "mojito";
    if (a.perfil === "amargo" || a.intensidad === "intensa") return "ipa";
    return "gintonic";
  }
  if (a.animo === "energia") {
    if (a.intensidad === "intensa" || a.perfil === "amargo") return "espresso";
    if (a.momento === "tarde") return "coldbrew";
    return "latte";
  }
  if (a.animo === "fresco") {
    if (a.perfil === "dulce") return "limonada";
    if (a.perfil === "amargo") return "matcha";
    return "verde";
  }
  if (a.animo === "relax") return a.perfil === "amargo" ? "matcha" : "chai";
  if (a.animo === "celebrar") return "limonada";
  if (a.perfil === "dulce") return "latte";
  if (a.perfil === "citrico") return "limonada";
  return "coldbrew";
}

export default function FlowMatch() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const pick = (v: string) => {
    const Q = QUESTIONS[step];
    const next = { ...answers, [Q.key]: v };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setDone(true);
  };
  const restart = () => { setStep(0); setAnswers({}); setDone(false); };

  if (done) {
    const d = DRINKS[recommend(answers)];
    return (
      <div className="quizwrap">
        <div className="q-result">
          <div className="rk">Tu Flow Match</div>
          <div className="rname">{d.name}</div>
          <div className="rcat">{d.cat}</div>
          <p className="rdesc">{d.desc}</p>
          <p className="rpair">Va perfecto con <b>{d.pair}</b>.</p>
          <div className="actions">
            <a href="#menu" className="btn btn-primary">Añadir al pedido</a>
            <button className="btn btn-light" onClick={restart}>Volver a intentar</button>
          </div>
        </div>
      </div>
    );
  }

  const Q = QUESTIONS[step];
  return (
    <div className="quizwrap">
      <div className="q-progress" aria-hidden="true">
        {QUESTIONS.map((_, i) => <i key={i} className={i <= step ? "on" : ""}></i>)}
      </div>
      <div className="q-step">Pregunta {step + 1} de {QUESTIONS.length}</div>
      <h3 className="q-title">{Q.q}</h3>
      <div className="q-options" role="group" aria-label={Q.q}>
        {Q.opts.map((o) => (
          <button key={o.v} className="q-opt" onClick={() => pick(o.v)}>
            <span className="dot"></span>{o.t}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button className="q-back" onClick={() => setStep(step - 1)}>← Anterior</button>
      )}
    </div>
  );
}
