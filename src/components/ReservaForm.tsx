"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Zone = { id: string; name: string; capacity: number };

export default function ReservaForm({
  supabaseUrl,
  supabaseKey,
  whatsapp,
}: {
  supabaseUrl: string;
  supabaseKey: string;
  whatsapp: string;
}) {
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [party, setParty] = useState("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("reservation_zones").select("id,name,capacity").eq("active", true).order("name").then(({ data }) => {
      const z = (data as Zone[]) ?? [];
      setZones(z);
      if (z.length) setZoneId(z[0].id);
    });
  }, [supabase]);

  const submit = async () => {
    setError("");
    if (!zoneId || !date || !time) { setError("Elige zona, fecha y hora."); return; }
    if (!name.trim() || !phone.trim()) { setError("Escribe tu nombre y WhatsApp."); return; }
    const reservedAt = new Date(`${date}T${time}:00`);
    if (isNaN(reservedAt.getTime())) { setError("Fecha u hora inválida."); return; }

    setSending(true);
    const { data, error: err } = await supabase.rpc("create_reservation", {
      p_zone_id: zoneId,
      p_reserved_at: reservedAt.toISOString(),
      p_party: Number(party),
      p_name: name,
      p_phone: phone,
      p_email: email,
    });
    setSending(false);
    if (err) { setError("Error: " + err.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { setError(res.error || "No se pudo reservar."); return; }

    setDone(true);
    // Abrir WhatsApp con el mensaje listo
    const zoneName = zones.find((z) => z.id === zoneId)?.name ?? "";
    const msg = `¡Hola Acuarius! Quiero confirmar mi reserva:%0A` +
      `Nombre: ${name}%0AZona: ${zoneName}%0AFecha: ${date} ${time}%0APersonas: ${party}%0ATel: ${phone}`;
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
  };

  if (done) {
    return (
      <div className="reserva-form done">
        <div className="rf-check">✓</div>
        <h3>¡Reserva registrada!</h3>
        <p>Tu reserva quedó guardada. Te abrimos WhatsApp para que la confirmes con nosotros. ¡Te esperamos!</p>
        <button className="btn btn-ghost" onClick={() => { setDone(false); setName(""); setPhone(""); setEmail(""); }}>Hacer otra reserva</button>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="reserva-form">
      <div className="rf-grid">
        <label>Zona
          <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name} (hasta {z.capacity})</option>)}
          </select>
        </label>
        <label>Personas
          <input type="number" min={1} max={20} value={party} onChange={(e) => setParty(e.target.value)} />
        </label>
        <label>Fecha
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>Hora
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <label className="rf-full">Nombre completo
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
        </label>
        <label>WhatsApp
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Número" />
        </label>
        <label>Correo (opcional)
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
        </label>
      </div>
      {error && <p className="rf-error">{error}</p>}
      <button className="btn btn-primary rf-submit" onClick={submit} disabled={sending}>
        {sending ? "Verificando disponibilidad…" : "Reservar mi mesa"}
      </button>
      <p className="rf-note">Verificamos que la zona esté libre a esa hora. Recibirás confirmación por WhatsApp.</p>
    </div>
  );
}
