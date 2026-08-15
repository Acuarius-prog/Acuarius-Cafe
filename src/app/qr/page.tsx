"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Q = { n: number; img: string };

export default function QRPage() {
  const [qrs, setQrs] = useState<Q[]>([]);

  useEffect(() => {
    const origin = window.location.origin;
    Promise.all(
      Array.from({ length: 15 }, (_, i) => i + 1).map(async (n) => {
        const url = `${origin}/?mesa=${n}`;
        const img = await QRCode.toDataURL(url, {
          width: 320,
          margin: 1,
          color: { dark: "#0A3A5C", light: "#ffffff" },
        });
        return { n, img };
      })
    ).then(setQrs);
  }, []);

  return (
    <div className="qr-page">
      <div className="qr-head no-print">
        <h1>QR de mesas — Acuarius</h1>
        <p>Imprime esta página, recorta cada tarjeta y pégala en su mesa. El cliente escanea y pide desde su celular, sin esperar al mesero.</p>
        <button onClick={() => window.print()} className="btn btn-primary">Imprimir</button>
      </div>
      <div className="qr-grid">
        {qrs.map((q) => (
          <div className="qr-card" key={q.n}>
            <div className="qr-brand">Acuarius <span>Café &amp; Sabores</span></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={q.img} alt={`QR mesa ${q.n}`} />
            <div className="qr-mesa">Mesa {q.n}</div>
            <div className="qr-cta">Escanea y pide desde tu celular</div>
          </div>
        ))}
      </div>
    </div>
  );
}
