"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Category = { id: string; name: string };
type MenuItem = { id: string; name: string; description: string | null; price: number; cost: number; featured: boolean; active: boolean; category_id: string | null };
type OrderItem = { id: string; name: string; quantity: number; unit_price: number; subtotal: number; note: string | null; menu_item_id: string | null };
type Order = { id: string; channel: string; status: string; total: number; table_number: number | null; notes: string | null; created_at: string; order_items: OrderItem[] };
type Inv = { id: string; name: string; category: string | null; unit: string | null; stock: number; min_stock: number };
type Zone = { name: string } | null;
type Reservation = { id: string; party_size: number; reserved_at: string; status: string; notes: string | null; reservation_zones: Zone };
type Client = { id: string; full_name: string | null; role: string; flow_points: number; flow_tier: string };

const cop = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);
const ORDER_STATES = ["nuevo", "preparacion", "listo", "entregado"];
const STATE_LABEL: Record<string, string> = { nuevo: "Nuevo", preparacion: "En preparación", listo: "Listo", entregado: "Entregado", cancelado: "Cancelado" };

export default function AdminClient({ supabaseUrl, supabaseKey }: { supabaseUrl: string; supabaseKey: string }) {
  const [supabase] = useState<SupabaseClient>(() => createClient(supabaseUrl, supabaseKey));
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [msg, setMsg] = useState(""); const [section, setSection] = useState("dashboard");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inv, setInv] = useState<Inv[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [nName, setNName] = useState(""); const [nCat, setNCat] = useState("");
  const [nPrice, setNPrice] = useState(""); const [nCost, setNCost] = useState(""); const [nDesc, setNDesc] = useState("");
  const [iName, setIName] = useState(""); const [iStock, setIStock] = useState(""); const [iMin, setIMin] = useState(""); const [iUnit, setIUnit] = useState("unid.");
  const [period, setPeriod] = useState<"hoy" | "semana" | "mes">("semana");

  const flash = (t: string) => { setMsg(t); window.setTimeout(() => setMsg(""), 3000); };

  const loadAll = useCallback(async () => {
    const [c, i, o, iv, r, cl] = await Promise.all([
      supabase.from("menu_categories").select("id,name").order("sort_order"),
      supabase.from("menu_items").select("id,name,description,price,cost,featured,active,category_id").order("name"),
      supabase.from("orders").select("id,channel,status,total,table_number,notes,created_at,order_items(id,name,quantity,unit_price,subtotal,note,menu_item_id)").order("created_at", { ascending: false }).limit(200),
      supabase.from("inventory").select("*").order("name"),
      supabase.from("reservations").select("id,party_size,reserved_at,status,notes,reservation_zones(name)").order("reserved_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("id,full_name,role,flow_points,flow_tier").order("flow_points", { ascending: false }),
    ]);
    setCategories((c.data as Category[]) ?? []);
    setItems((i.data as MenuItem[]) ?? []);
    setOrders((o.data as unknown as Order[]) ?? []);
    setInv((iv.data as Inv[]) ?? []);
    setReservations((r.data as unknown as Reservation[]) ?? []);
    setClients((cl.data as Client[]) ?? []);
    if (c.data && (c.data as Category[]).length) setNCat((c.data as Category[])[0].id);
  }, [supabase]);

  const checkSession = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) { setUserEmail(null); setRole(null); setReady(true); return; }
    setUserEmail(user.email ?? "");
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const r = (prof as { role: string } | null)?.role ?? "customer";
    setRole(r);
    if (r === "admin" || r === "staff") await loadAll();
    setReady(true);
  }, [supabase, loadAll]);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { flash("Error: " + error.message); return; }
    await checkSession();
  };
  const logout = async () => { await supabase.auth.signOut(); setUserEmail(null); setRole(null); };

  const addItem = async () => {
    if (!nName || !nPrice) { flash("Escribe al menos nombre y precio."); return; }
    const { error } = await supabase.from("menu_items").insert({ name: nName, category_id: nCat || null, price: Number(nPrice), cost: Number(nCost || 0), description: nDesc || null, active: true });
    if (error) { flash("No se pudo agregar: " + error.message); return; }
    setNName(""); setNPrice(""); setNCost(""); setNDesc(""); flash("Producto agregado"); await loadAll();
  };
  const patchItem = (id: string, patch: Partial<MenuItem>) => setItems((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const saveItem = async (it: MenuItem) => {
    const { error } = await supabase.from("menu_items").update({ name: it.name, description: it.description, price: Number(it.price), cost: Number(it.cost), category_id: it.category_id, featured: it.featured, active: it.active }).eq("id", it.id);
    flash(error ? "Error: " + error.message : "Guardado");
  };
  const toggleItem = async (it: MenuItem, f: "active" | "featured") => {
    const v = !it[f]; patchItem(it.id, { [f]: v } as Partial<MenuItem>);
    await supabase.from("menu_items").update({ [f]: v }).eq("id", it.id);
  };
  const removeItem = async (it: MenuItem) => {
    if (!confirm("¿Eliminar \"" + it.name + "\"?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", it.id);
    if (error) { flash("Error: " + error.message); return; }
    flash("Eliminado"); await loadAll();
  };

  const advanceOrder = async (o: Order) => {
    const i = ORDER_STATES.indexOf(o.status);
    if (i < 0 || i >= ORDER_STATES.length - 1) return;
    const next = ORDER_STATES[i + 1];
    setOrders((p) => p.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    await supabase.from("orders").update({ status: next }).eq("id", o.id);
    flash(o.id.slice(0, 8) + " -> " + STATE_LABEL[next]);
  };
  const cancelOrder = async (o: Order) => {
    setOrders((p) => p.map((x) => (x.id === o.id ? { ...x, status: "cancelado" } : x)));
    await supabase.from("orders").update({ status: "cancelado" }).eq("id", o.id);
  };

  const addInv = async () => {
    if (!iName) { flash("Escribe el nombre del insumo."); return; }
    const { error } = await supabase.from("inventory").insert({ name: iName, stock: Number(iStock || 0), min_stock: Number(iMin || 0), unit: iUnit || "unid." });
    if (error) { flash("Error: " + error.message); return; }
    setIName(""); setIStock(""); setIMin(""); flash("Insumo agregado"); await loadAll();
  };
  const patchInv = (id: string, patch: Partial<Inv>) => setInv((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const saveInv = async (x: Inv) => { await supabase.from("inventory").update({ name: x.name, stock: Number(x.stock), min_stock: Number(x.min_stock), unit: x.unit }).eq("id", x.id); flash("Guardado"); };

  const setResStatus = async (r: Reservation, status: string) => {
    setReservations((p) => p.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await supabase.from("reservations").update({ status }).eq("id", r.id);
  };

  if (!ready) return <div className="admin-shell"><div className="admin-container"><p className="admin-muted" style={{ padding: 40 }}>Cargando...</p></div></div>;

  if (!userEmail) return (
    <div className="admin-shell"><div className="admin-login">
      <div className="admin-brand"><span className="am-mark">Acuarius</span><span className="am-sub">Admin</span></div>
      <h1 className="admin-h">Ingresa a tu panel</h1>
      <form onSubmit={login} className="admin-form">
        <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="admin-btn primary" type="submit">Entrar</button>
      </form>
      {msg && <p className="admin-msg">{msg}</p>}
    </div></div>
  );

  if (role !== "admin" && role !== "staff") return (
    <div className="admin-shell"><div className="admin-login">
      <h1 className="admin-h">Sin permisos de administrador</h1>
      <p className="admin-muted">La cuenta <b>{userEmail}</b> no es administradora. En Supabase ejecuta el update de rol admin.</p>
      <button className="admin-btn ghost" onClick={logout} style={{ color: "var(--ink)", borderColor: "var(--line)" }}>Cerrar sesión</button>
    </div></div>
  );

  const now = new Date();
  const sinceD = new Date(now);
  if (period === "hoy") sinceD.setHours(0, 0, 0, 0);
  else if (period === "semana") sinceD.setDate(now.getDate() - 7);
  else sinceD.setDate(now.getDate() - 30);
  const paidOrders = orders.filter((o) => o.status !== "cancelado");
  const periodOrders = paidOrders.filter((o) => new Date(o.created_at) >= sinceD);
  const ventas = periodOrders.reduce((a, o) => a + Number(o.total), 0);
  const nPed = periodOrders.length;
  const ticket = nPed ? ventas / nPed : 0;
  const costMap: Record<string, number> = {};
  items.forEach((it) => { costMap[it.id] = Number(it.cost); });
  let costoTotal = 0;
  const prodStats: Record<string, { name: string; qty: number; ventas: number; costo: number }> = {};
  periodOrders.forEach((o) => o.order_items?.forEach((li) => {
    const key = li.menu_item_id || li.name;
    if (!prodStats[key]) prodStats[key] = { name: li.name, qty: 0, ventas: 0, costo: 0 };
    const c = (li.menu_item_id ? costMap[li.menu_item_id] : 0) || 0;
    prodStats[key].qty += li.quantity; prodStats[key].ventas += Number(li.subtotal); prodStats[key].costo += c * li.quantity; costoTotal += c * li.quantity;
  }));
  const utilidad = ventas - costoTotal;
  const margenPct = ventas ? Math.round((utilidad / ventas) * 100) : 0;
  const topProducts = Object.values(prodStats).sort((a, b) => b.ventas - a.ventas).slice(0, 8);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const ventasHoy = paidOrders.filter((o) => new Date(o.created_at) >= todayStart).reduce((a, o) => a + Number(o.total), 0);
  const pedidosHoy = paidOrders.filter((o) => new Date(o.created_at) >= todayStart).length;
  const activos = orders.filter((o) => o.status === "nuevo" || o.status === "preparacion" || o.status === "listo").length;
  const NAV = [
    { id: "dashboard", label: "Dashboard", badge: 0 },
    { id: "pedidos", label: "Pedidos", badge: activos },
    { id: "menu", label: "Menú", badge: 0 },
    { id: "reportes", label: "Reportes", badge: 0 },
    { id: "inventario", label: "Inventario", badge: 0 },
    { id: "reservas", label: "Reservas", badge: 0 },
    { id: "clientes", label: "Clientes", badge: 0 },
  ];
  const fmtDate = (s: string) => new Date(s).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="admin-brand" style={{ padding: "4px 8px 18px" }}><span className="am-mark">Acuarius</span><span className="am-sub">Admin</span></div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <button key={n.id} className={"adm-navitem" + (section === n.id ? " on" : "")} onClick={() => setSection(n.id)}>
              {n.label}{n.badge ? <span className="adm-badge">{n.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="adm-user"><span>{userEmail}</span><button className="admin-btn ghost sm" onClick={logout}>Salir</button></div>
      </aside>

      <main className="adm-main">
        {msg && <div className="admin-toast">{msg}</div>}

        {section === "dashboard" && (<>
          <h1 className="adm-title">Buenos momentos 👋</h1>
          <div className="kpis">
            <div className="kpi"><div className="lbl">Ventas de hoy</div><div className="val">{cop(ventasHoy)}</div></div>
            <div className="kpi"><div className="lbl">Pedidos hoy</div><div className="val">{pedidosHoy}</div></div>
            <div className="kpi"><div className="lbl">Pedidos activos</div><div className="val">{activos}</div></div>
            <div className="kpi"><div className="lbl">Miembros Flow</div><div className="val">{clients.length}</div></div>
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Últimos pedidos</h2>
            {orders.length === 0 ? <p className="admin-muted">Aún no hay pedidos.</p> : (
              <table className="adm-table2"><thead><tr><th>Pedido</th><th>Canal</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
                <tbody>{orders.slice(0, 8).map((o) => (
                  <tr key={o.id}><td>#{o.id.slice(0, 6)}</td><td>{o.table_number ? "Mesa " + o.table_number : o.channel}</td><td>{cop(o.total)}</td><td><span className={"st st-" + o.status}>{STATE_LABEL[o.status] || o.status}</span></td><td>{fmtDate(o.created_at)}</td></tr>
                ))}</tbody></table>
            )}
          </div>
        </>)}

        {section === "pedidos" && (<>
          <h1 className="adm-title">Pedidos</h1>
          {orders.length === 0 && <div className="admin-card"><p className="admin-muted">Aún no llegan pedidos. Cuando un cliente ordene desde la web, aparecerá aquí.</p></div>}
          <div className="orders-grid">
            {orders.filter((o) => o.status !== "entregado" && o.status !== "cancelado").map((o) => (
              <div className="ordercard" key={o.id}>
                <div className="oc-head"><b>#{o.id.slice(0, 6)}</b><span className={"st st-" + o.status}>{STATE_LABEL[o.status]}</span></div>
                <div className="oc-meta">{o.table_number ? <b style={{color:"var(--orange-deep)"}}>Mesa {o.table_number} · </b> : null}{o.channel} · {fmtDate(o.created_at)}</div>
                <div className="oc-items">{o.order_items?.map((li) => (<div key={li.id} className="oc-li"><span>{li.quantity}× {li.name}</span>{li.note ? <em> — {li.note}</em> : null}</div>))}</div>
                {o.notes && <div className="oc-note">📝 {o.notes}</div>}
                <div className="oc-foot"><b>{cop(o.total)}</b>
                  <div className="oc-actions">
                    <button className="admin-btn sm danger" onClick={() => cancelOrder(o)}>Cancelar</button>
                    <button className="admin-btn sm primary" onClick={() => advanceOrder(o)}>{o.status === "listo" ? "Entregar ✓" : "Avanzar →"}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Historial (entregados)</h2>
            {orders.filter((o) => o.status === "entregado").length === 0 ? <p className="admin-muted">Sin pedidos entregados aún.</p> :
              <table className="adm-table2"><thead><tr><th>Pedido</th><th>Total</th><th>Fecha</th></tr></thead>
                <tbody>{orders.filter((o) => o.status === "entregado").slice(0, 20).map((o) => (<tr key={o.id}><td>#{o.id.slice(0, 6)}</td><td>{cop(o.total)}</td><td>{fmtDate(o.created_at)}</td></tr>))}</tbody></table>}
          </div>
        </>)}

        {section === "menu" && (<>
          <h1 className="adm-title">Menú</h1>
          <div className="admin-card">
            <h2 className="admin-h2">Agregar producto</h2>
            <div className="am-addgrid am-addgrid5">
              <input placeholder="Nombre" value={nName} onChange={(e) => setNName(e.target.value)} />
              <select value={nCat} onChange={(e) => setNCat(e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input type="number" placeholder="Precio" value={nPrice} onChange={(e) => setNPrice(e.target.value)} />
              <input type="number" placeholder="Costo" value={nCost} onChange={(e) => setNCost(e.target.value)} />
              <button className="admin-btn primary" onClick={addItem}>Agregar</button>
            </div>
            <input style={{ marginTop: 10, width: "100%", padding: ".6em .7em", border: "1px solid var(--line)", borderRadius: 9, fontFamily: "inherit" }} placeholder="Descripción (opcional)" value={nDesc} onChange={(e) => setNDesc(e.target.value)} />
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Productos ({items.length})</h2>
            <div className="am-table">
              <div className="am-thead am-thead6"><span>Producto</span><span>Categoría</span><span>Precio</span><span>Costo</span><span>Margen</span><span></span></div>
              {items.map((it) => {
                const m = it.price ? Math.round(((it.price - it.cost) / it.price) * 100) : 0;
                return (
                  <div className={"am-row am-row6" + (it.active ? "" : " off")} key={it.id}>
                    <input className="am-in" value={it.name} onChange={(e) => patchItem(it.id, { name: e.target.value })} />
                    <select className="am-in" value={it.category_id ?? ""} onChange={(e) => patchItem(it.id, { category_id: e.target.value })}><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <input className="am-in am-price" type="number" value={it.price} onChange={(e) => patchItem(it.id, { price: Number(e.target.value) })} />
                    <input className="am-in am-price" type="number" value={it.cost} onChange={(e) => patchItem(it.id, { cost: Number(e.target.value) })} />
                    <span className={"margin" + (m < 30 ? " low" : "")}>{m}%</span>
                    <div className="am-actions">
                      <button className={"am-toggle" + (it.active ? " on" : "")} onClick={() => toggleItem(it, "active")} title="Activo"><i></i></button>
                      <button className={"am-toggle gold" + (it.featured ? " on" : "")} onClick={() => toggleItem(it, "featured")} title="Favorito"><i></i></button>
                      <button className="admin-btn sm" onClick={() => saveItem(it)}>Guardar</button>
                      <button className="admin-btn sm danger" onClick={() => removeItem(it)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>)}

        {section === "reportes" && (<>
          <div className="adm-titlerow">
            <h1 className="adm-title">Reportes de ventas</h1>
            <div className="seg">{(["hoy", "semana", "mes"] as const).map((p) => (<button key={p} className={"seg-b" + (period === p ? " on" : "")} onClick={() => setPeriod(p)}>{p === "hoy" ? "Hoy" : p === "semana" ? "7 días" : "30 días"}</button>))}</div>
          </div>
          <div className="kpis">
            <div className="kpi"><div className="lbl">Ventas</div><div className="val">{cop(ventas)}</div></div>
            <div className="kpi"><div className="lbl">Pedidos</div><div className="val">{nPed}</div></div>
            <div className="kpi"><div className="lbl">Ticket promedio</div><div className="val">{cop(ticket)}</div></div>
            <div className="kpi hl"><div className="lbl">Utilidad bruta</div><div className="val">{cop(utilidad)}</div><span className="kpi-sub">margen {margenPct}%</span></div>
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Productos más vendidos</h2>
            {topProducts.length === 0 ? <p className="admin-muted">Sin ventas en este período.</p> : (
              <table className="adm-table2"><thead><tr><th>Producto</th><th>Cant.</th><th>Ventas</th><th>Costo</th><th>Utilidad</th></tr></thead>
                <tbody>{topProducts.map((p) => (<tr key={p.name}><td>{p.name}</td><td>{p.qty}</td><td>{cop(p.ventas)}</td><td>{cop(p.costo)}</td><td style={{ fontWeight: 700, color: "var(--olive)" }}>{cop(p.ventas - p.costo)}</td></tr>))}</tbody></table>
            )}
            <p className="admin-muted" style={{ marginTop: 14, fontSize: ".82rem" }}>* La utilidad es bruta y aproximada: usa el costo que tengas puesto en cada producto. No reemplaza la contabilidad formal.</p>
          </div>
        </>)}

        {section === "inventario" && (<>
          <h1 className="adm-title">Inventario</h1>
          <div className="admin-card">
            <h2 className="admin-h2">Agregar insumo</h2>
            <div className="am-addgrid am-addgrid5">
              <input placeholder="Insumo (ej: Leche)" value={iName} onChange={(e) => setIName(e.target.value)} />
              <input placeholder="Unidad (L, kg...)" value={iUnit} onChange={(e) => setIUnit(e.target.value)} />
              <input type="number" placeholder="Stock" value={iStock} onChange={(e) => setIStock(e.target.value)} />
              <input type="number" placeholder="Mínimo" value={iMin} onChange={(e) => setIMin(e.target.value)} />
              <button className="admin-btn primary" onClick={addInv}>Agregar</button>
            </div>
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Insumos ({inv.length})</h2>
            {inv.length === 0 ? <p className="admin-muted">Aún no hay insumos. Agrégalos arriba para controlar tu stock.</p> : (
              <div className="am-table">
                <div className="am-thead" style={{ gridTemplateColumns: "1.6fr .8fr .8fr .8fr auto" }}><span>Insumo</span><span>Unidad</span><span>Stock</span><span>Mínimo</span><span></span></div>
                {inv.map((x) => {
                  const low = Number(x.stock) < Number(x.min_stock);
                  return (
                    <div className="am-row" style={{ gridTemplateColumns: "1.6fr .8fr .8fr .8fr auto", background: low ? "rgba(217,83,79,.06)" : undefined }} key={x.id}>
                      <input className="am-in" value={x.name} onChange={(e) => patchInv(x.id, { name: e.target.value })} />
                      <input className="am-in" value={x.unit ?? ""} onChange={(e) => patchInv(x.id, { unit: e.target.value })} />
                      <input className="am-in" type="number" value={x.stock} onChange={(e) => patchInv(x.id, { stock: Number(e.target.value) })} style={{ color: low ? "#D9534F" : undefined, fontWeight: low ? 700 : 400 }} />
                      <input className="am-in" type="number" value={x.min_stock} onChange={(e) => patchInv(x.id, { min_stock: Number(e.target.value) })} />
                      <div className="am-actions">{low && <span className="st st-nuevo">Reponer</span>}<button className="admin-btn sm" onClick={() => saveInv(x)}>Guardar</button></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>)}

        {section === "reservas" && (<>
          <h1 className="adm-title">Reservas</h1>
          <div className="admin-card">
            {reservations.length === 0 ? <p className="admin-muted">No hay reservas registradas.</p> : (
              <table className="adm-table2"><thead><tr><th>Fecha</th><th>Zona</th><th>Personas</th><th>Estado</th><th></th></tr></thead>
                <tbody>{reservations.map((r) => (
                  <tr key={r.id}><td>{fmtDate(r.reserved_at)}</td><td>{r.reservation_zones?.name ?? "—"}</td><td>{r.party_size}</td>
                    <td><span className={"st st-" + (r.status === "confirmada" ? "listo" : r.status === "cancelada" ? "cancelado" : "nuevo")}>{r.status}</span></td>
                    <td className="am-actions"><button className="admin-btn sm primary" onClick={() => setResStatus(r, "confirmada")}>Confirmar</button><button className="admin-btn sm danger" onClick={() => setResStatus(r, "cancelada")}>Cancelar</button></td></tr>
                ))}</tbody></table>
            )}
          </div>
        </>)}

        {section === "clientes" && (<>
          <h1 className="adm-title">Clientes Flow</h1>
          <div className="admin-card">
            {clients.length === 0 ? <p className="admin-muted">Aún no hay clientes registrados.</p> : (
              <table className="adm-table2"><thead><tr><th>Nombre</th><th>Rol</th><th>Nivel</th><th>Puntos</th></tr></thead>
                <tbody>{clients.map((c) => (<tr key={c.id}><td>{c.full_name || "—"}</td><td>{c.role}</td><td>{c.flow_tier}</td><td style={{ fontWeight: 700 }}>{c.flow_points}</td></tr>))}</tbody></table>
            )}
          </div>
        </>)}
      </main>
    </div>
  );
}
