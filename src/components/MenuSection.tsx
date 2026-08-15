"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type Category = { id: string; name: string; slug?: string };
type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  featured: boolean;
  category_id: string | null;
  image_url: string | null;
};
type Line = { item: Item; qty: number; note: string };

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function MenuSection({
  categories,
  items,
  supabaseUrl,
  supabaseKey,
  table,
}: {
  categories: Category[];
  items: Item[];
  supabaseUrl: string;
  supabaseKey: string;
  table?: number | null;
}) {
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));
  const [active, setActive] = useState<string>("all");
  const [flowUserId, setFlowUserId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState<string>("");
  const [cart, setCart] = useState<Record<string, Line>>({});
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("local");
  const [gnote, setGnote] = useState("");
  const [sending, setSending] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setFlowUserId(data.user.id);
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).single();
        const nm = (prof as { full_name: string | null } | null)?.full_name;
        if (nm) setName(nm);
      }
    });
  }, [supabase]);

  const lines = Object.values(cart);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + l.item.price * l.qty, 0);
  const filtered = active === "all" ? items : items.filter((i) => i.category_id === active);

  const add = (it: Item) =>
    setCart((c) => ({
      ...c,
      [it.id]: { item: it, qty: (c[it.id]?.qty || 0) + 1, note: c[it.id]?.note || "" },
    }));
  const setQty = (id: string, d: number) =>
    setCart((c) => {
      const l = c[id];
      if (!l) return c;
      const q = l.qty + d;
      const n = { ...c };
      if (q <= 0) delete n[id];
      else n[id] = { ...l, qty: q };
      return n;
    });
  const setNote = (id: string, note: string) =>
    setCart((c) => (c[id] ? { ...c, [id]: { ...c[id], note } } : c));

  const pick = (id: string) => {
    setActive(id);
    document.getElementById("carta-lista")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const send = async () => {
    if (lines.length === 0) return;
    if (!name.trim()) {
      setError("Escribe tu nombre.");
      return;
    }
    if (!table && !phone.trim()) {
      setError("Escribe tu teléfono.");
      return;
    }
    setSending(true);
    setError("");
    const { data, error } = await supabase.rpc("place_order", {
      p_channel: channel,
      p_customer: { name, phone },
      p_notes: gnote,
      p_table: table ?? null,
      p_user: flowUserId ?? null,
      p_items: lines.map((l) => ({
        menu_item_id: l.item.id,
        name: l.item.name,
        unit_price: l.item.price,
        quantity: l.qty,
        note: l.note,
      })),
    });
    setSending(false);
    if (error) {
      setError("No se pudo enviar el pedido: " + error.message);
      return;
    }
    setOrderId(String(data));
    setCart({});
  };

  const closeConfirm = () => {
    setOrderId(null);
    setOpen(false);
    setName("");
    setPhone("");
    setGnote("");
  };

  return (
    <>
      {table ? <div className="mesa-chip">📍 Estás en la <b>Mesa {table}</b> · pide desde aquí</div> : null}
      {flowUserId ? <div className="flow-chip">✓ Estás ganando <b>puntos Flow</b> con este pedido</div> : null}

      {/* Tarjetas de categoría (clicables) */}
      <div className="cat-cards">
        <button className={"cat-card" + (active === "all" ? " on" : "")} onClick={() => pick("all")}>
          <h3>Todo</h3>
          <p>Ver la carta completa</p>
        </button>
        {categories.map((c) => {
          const n = items.filter((i) => i.category_id === c.id).length;
          return (
            <button key={c.id} className={"cat-card" + (active === c.id ? " on" : "")} onClick={() => pick(c.id)}>
              <h3>{c.name}</h3>
              <p>{n} producto{n === 1 ? "" : "s"}</p>
            </button>
          );
        })}
      </div>

      {/* Pestañas rápidas */}
      <div className="tabs" id="carta-lista">
        <button className={"tab" + (active === "all" ? " on" : "")} onClick={() => setActive("all")}>Todo</button>
        {categories.map((c) => (
          <button key={c.id} className={"tab" + (active === c.id ? " on" : "")} onClick={() => setActive(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Lista de productos filtrada */}
      <div className="prod-list">
        {filtered.map((it) => (
          <article key={it.id} className={"prod-card" + (it.featured ? " feat" : "")}>
            {it.image_url && (
              <div className="pc-photo">
                <img src={it.image_url} alt={it.name} loading="lazy" />
                {it.featured && <span className="pc-badge">Favorito</span>}
              </div>
            )}
            <div className="pc-body">
              <h4>{!it.image_url && it.featured ? <span className="badge">Favorito</span> : null}{it.name}</h4>
              {it.description && <p>{it.description}</p>}
              <div className="pc-foot">
                <span className="prod-price">{cop(Number(it.price))}</span>
                <button className="prod-add" onClick={() => add(it)} aria-label={"Agregar " + it.name}>+</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Barra flotante del carrito */}
      {count > 0 && (
        <button className="cartbar" onClick={() => setOpen(true)}>
          <span className="cartbar-count">{count}</span>
          <span>Ver mi pedido</span>
          <span className="cartbar-total">{cop(total)}</span>
        </button>
      )}

      {/* Cajón del carrito */}
      {open && (
        <div className="cart-overlay" onClick={() => !orderId && setOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            {orderId ? (
              <div className="cart-confirm">
                <div className="cc-check">✓</div>
                <h3>¡Pedido enviado!</h3>
                <p>{table ? `Tu pedido para la Mesa ${table} quedó registrado.` : "Tu pedido quedó registrado."} Nuestro equipo lo verá en el panel y lo preparará.</p>
                <p className="cc-num">N° {orderId.slice(0, 8).toUpperCase()}</p>
                <button className="btn btn-primary" onClick={closeConfirm}>Listo</button>
              </div>
            ) : (
              <>
                <div className="cart-head">
                  <h3>Tu pedido</h3>
                  <button className="cart-x" onClick={() => setOpen(false)}>×</button>
                </div>

                <div className="cart-lines">
                  {lines.length === 0 && <p className="muted">Tu pedido está vacío.</p>}
                  {lines.map((l) => (
                    <div className="cart-line" key={l.item.id}>
                      <div className="cl-top">
                        <span className="cl-name">{l.item.name}</span>
                        <span className="cl-price">{cop(l.item.price * l.qty)}</span>
                      </div>
                      <div className="cl-controls">
                        <div className="qty">
                          <button onClick={() => setQty(l.item.id, -1)}>−</button>
                          <b>{l.qty}</b>
                          <button onClick={() => setQty(l.item.id, 1)}>+</button>
                        </div>
                      </div>
                      <input
                        className="cl-note"
                        placeholder="Nota (ej: sin azúcar, para llevar…)"
                        value={l.note}
                        onChange={(e) => setNote(l.item.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {lines.length > 0 && (
                  <div className="cart-form">
                    <div className="cart-total">
                      <span>Total</span>
                      <b>{cop(total)}</b>
                    </div>
                    <label>Tu nombre
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
                    </label>
                    {table ? (
                      <div className="mesa-note">📍 Pedido para la <b>Mesa {table}</b></div>
                    ) : (
                      <>
                        <label>Teléfono
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono / WhatsApp" />
                        </label>
                        <label>¿Cómo lo quieres?
                          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                            <option value="local">Para consumir en el local</option>
                            <option value="para_llevar">Para llevar</option>
                            <option value="domicilio">Domicilio</option>
                          </select>
                        </label>
                      </>
                    )}
                    <label>Nota general (opcional)
                      <input value={gnote} onChange={(e) => setGnote(e.target.value)} placeholder="Dirección, indicaciones…" />
                    </label>
                    {error && <p className="cart-err">{error}</p>}
                    <button className="btn btn-primary cart-send" onClick={send} disabled={sending}>
                      {sending ? "Enviando…" : `Enviar pedido · ${cop(total)}`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
