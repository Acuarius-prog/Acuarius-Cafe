"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Category = { id: string; name: string };
type MenuItem = { id: string; name: string; description: string | null; price: number; cost: number; featured: boolean; active: boolean; category_id: string | null; image_url: string | null };
type OrderItem = { id: string; name: string; quantity: number; unit_price: number; subtotal: number; note: string | null; menu_item_id: string | null };
type Order = { id: string; channel: string; status: string; total: number; table_number: number | null; notes: string | null; created_at: string; order_items: OrderItem[] };
type Inv = { id: string; name: string; category: string | null; unit: string | null; stock: number; min_stock: number };
type Zone = { name: string } | null;
type Reservation = { id: string; party_size: number; reserved_at: string; status: string; notes: string | null; reservation_zones: Zone };
type Client = { id: string; full_name: string | null; role: string; flow_points: number; flow_tier: string };
type Product = { id: string; name: string; description: string | null; price: number; stock: number; active: boolean; image_url: string | null };
type ResZone = { id: string; name: string; capacity: number; active: boolean; image_url: string | null };
type AdminUser = { id: string; full_name: string | null; role: string; email: string; perms: Record<string, boolean> };

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
  const [recovery, setRecovery] = useState(false); const [newPass, setNewPass] = useState("");
  const [myPerms, setMyPerms] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inv, setInv] = useState<Inv[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<ResZone[]>([]);
  const [pName, setPName] = useState(""); const [pPrice, setPPrice] = useState(""); const [pStock, setPStock] = useState(""); const [pDesc, setPDesc] = useState("");
  const [zName, setZName] = useState(""); const [zCap, setZCap] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [nName, setNName] = useState(""); const [nCat, setNCat] = useState("");
  const [nPrice, setNPrice] = useState(""); const [nCost, setNCost] = useState(""); const [nDesc, setNDesc] = useState("");
  const [iName, setIName] = useState(""); const [iStock, setIStock] = useState(""); const [iMin, setIMin] = useState(""); const [iUnit, setIUnit] = useState("unid.");
  const [period, setPeriod] = useState<"hoy" | "semana" | "mes">("semana");

  const flash = (t: string) => { setMsg(t); window.setTimeout(() => setMsg(""), 3000); };

  const loadAll = useCallback(async () => {
    const [c, i, o, iv, r, cl] = await Promise.all([
      supabase.from("menu_categories").select("id,name").order("sort_order"),
      supabase.from("menu_items").select("id,name,description,price,cost,featured,active,category_id,image_url").order("name"),
      supabase.from("orders").select("id,channel,status,total,table_number,notes,created_at,order_items(id,name,quantity,unit_price,subtotal,note,menu_item_id)").order("created_at", { ascending: false }).limit(200),
      supabase.from("inventory").select("*").order("name"),
      supabase.from("reservations").select("id,party_size,reserved_at,status,notes,reservation_zones(name)").order("reserved_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("id,full_name,role,flow_points,flow_tier").order("flow_points", { ascending: false }),
    ]);
    const [pr, zn] = await Promise.all([
      supabase.from("products").select("id,name,description,price,stock,active,image_url").order("name"),
      supabase.from("reservation_zones").select("id,name,capacity,active,image_url").order("name"),
    ]);
    setProducts((pr.data as Product[]) ?? []);
    setZones((zn.data as ResZone[]) ?? []);
    const { data: us } = await supabase.rpc("list_users");
    setUsers((us as AdminUser[]) ?? []);
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
    const { data: acc } = await supabase.rpc("my_access");
    const a = acc as { role: string; perms: Record<string, boolean> } | null;
    const r = a?.role ?? "customer";
    setRole(r); setMyPerms(a?.perms ?? {});
    if (r === "admin" || r === "staff" || r === "superadmin") await loadAll();
    setReady(true);
  }, [supabase, loadAll]);

  useEffect(() => {
    checkSession();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [checkSession, supabase]);

  const forgot = async () => {
    if (!email.trim()) { flash("Escribe tu correo arriba primero."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/admin" });
    flash(error ? "Error: " + error.message : "Correo de recuperación enviado. Revisa tu bandeja (y spam).");
  };
  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) { flash("Mínimo 6 caracteres."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { flash("Error: " + error.message); return; }
    setRecovery(false); setNewPass(""); await checkSession();
  };

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

  const uploadPhoto = async (it: MenuItem, file: File) => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = it.id + "." + ext;
    const { error: upErr } = await supabase.storage.from("menu-images").upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) { flash("No se pudo subir: " + upErr.message); return; }
    const { data: pub } = supabase.storage.from("menu-images").getPublicUrl(path);
    const url = pub.publicUrl + "?v=" + Date.now();
    const { error } = await supabase.from("menu_items").update({ image_url: url }).eq("id", it.id);
    if (error) { flash("Error: " + error.message); return; }
    patchItem(it.id, { image_url: url });
    flash("Foto actualizada");
  };

  const uploadImage = async (bucket: string, id: string, file: File): Promise<string | null> => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = id + "." + ext;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) { flash("No se pudo subir: " + error.message); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl + "?v=" + Date.now();
  };

  // Tienda
  const addProduct = async () => {
    if (!pName || !pPrice) { flash("Nombre y precio del kit."); return; }
    const { error } = await supabase.from("products").insert({ name: pName, price: Number(pPrice), stock: Number(pStock || 0), description: pDesc || null, active: true });
    if (error) { flash("Error: " + error.message); return; }
    setPName(""); setPPrice(""); setPStock(""); setPDesc(""); flash("Kit agregado"); await loadAll();
  };
  const patchProduct = (id: string, patch: Partial<Product>) => setProducts((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const saveProduct = async (x: Product) => { await supabase.from("products").update({ name: x.name, price: Number(x.price), stock: Number(x.stock), description: x.description, active: x.active }).eq("id", x.id); flash("Guardado"); };
  const removeProduct = async (x: Product) => { if (!confirm("¿Eliminar \"" + x.name + "\"?")) return; await supabase.from("products").delete().eq("id", x.id); flash("Eliminado"); await loadAll(); };
  const uploadProductPhoto = async (x: Product, file: File) => { const url = await uploadImage("product-images", "kit-" + x.id, file); if (!url) return; await supabase.from("products").update({ image_url: url }).eq("id", x.id); patchProduct(x.id, { image_url: url }); flash("Foto actualizada"); };

  // Zonas de reserva
  const addZone = async () => {
    if (!zName) { flash("Nombre de la zona."); return; }
    const { error } = await supabase.from("reservation_zones").insert({ name: zName, capacity: Number(zCap || 4), active: true });
    if (error) { flash("Error: " + error.message); return; }
    setZName(""); setZCap(""); flash("Zona agregada"); await loadAll();
  };
  const patchZone = (id: string, patch: Partial<ResZone>) => setZones((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const saveZone = async (x: ResZone) => { await supabase.from("reservation_zones").update({ name: x.name, capacity: Number(x.capacity), active: x.active }).eq("id", x.id); flash("Guardado"); };
  const removeZone = async (x: ResZone) => { if (!confirm("¿Eliminar \"" + x.name + "\"?")) return; await supabase.from("reservation_zones").delete().eq("id", x.id); flash("Eliminado"); await loadAll(); };
  const uploadZonePhoto = async (x: ResZone, file: File) => { const url = await uploadImage("product-images", "zona-" + x.id, file); if (!url) return; await supabase.from("reservation_zones").update({ image_url: url }).eq("id", x.id); patchZone(x.id, { image_url: url }); flash("Foto actualizada"); };

  const setRoleFor = async (email: string, newRole: string) => {
    const { data, error } = await supabase.rpc("set_user_role", { p_email: email, p_role: newRole });
    if (error) { flash("Error: " + error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { flash(res.error || "No se pudo cambiar el rol."); return; }
    flash("Rol actualizado ✓");
    const { data: us } = await supabase.rpc("list_users");
    setUsers((us as AdminUser[]) ?? []);
  };
  const setUserPerms = async (u: AdminUser, sectionId: string, value: boolean) => {
    const nextPerms = { ...(u.perms || {}), [sectionId]: value };
    const { data, error } = await supabase.rpc("set_user_perms", { p_email: u.email, p_perms: nextPerms });
    if (error) { flash("Error: " + error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { flash(res.error || "No se pudo guardar."); return; }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, perms: nextPerms } : x)));
    flash("Permiso actualizado ✓");
  };
  const addAdminByEmail = async () => {
    if (!newAdminEmail.trim()) { flash("Escribe el correo."); return; }
    await setRoleFor(newAdminEmail.trim(), "admin");
    setNewAdminEmail("");
  };

  const deleteOrder = async (o: Order) => {
    if (!confirm("¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.")) return;
    const { data, error } = await supabase.rpc("delete_order", { p_order_id: o.id });
    if (error) { flash("Error: " + error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { flash(res.error || "No se pudo eliminar."); return; }
    flash("Pedido eliminado ✓"); await loadAll();
  };
  const deleteReservation = async (r: Reservation) => {
    if (!confirm("¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.")) return;
    const { data, error } = await supabase.rpc("delete_reservation", { p_id: r.id });
    if (error) { flash("Error: " + error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { flash(res.error || "No se pudo eliminar."); return; }
    flash("Reserva eliminada ✓"); await loadAll();
  };
  const deleteClient = async (c: Client) => {
    if (!confirm("¿Estás seguro de eliminar a este cliente? Se borrarán sus puntos e historial de Flow. Esta acción no se puede deshacer.")) return;
    const { data, error } = await supabase.rpc("delete_client", { p_id: c.id });
    if (error) { flash("Error: " + error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { flash(res.error || "No se pudo eliminar."); return; }
    flash("Cliente eliminado ✓"); await loadAll();
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

  if (recovery) return (
    <div className="admin-shell"><div className="admin-login">
      <h1 className="admin-h">Nueva contraseña</h1>
      <form onSubmit={setNewPassword} className="admin-form">
        <label>Nueva contraseña<input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={6} /></label>
        <button className="admin-btn primary" type="submit">Guardar</button>
      </form>
      {msg && <p className="admin-msg">{msg}</p>}
    </div></div>
  );

  if (!userEmail) return (
    <div className="admin-shell"><div className="admin-login">
      <div className="adm-brand2 center"><img src="/logo.jpg" alt="Acuarius" className="adm-logo" /><div className="adm-brandtxt"><span className="am-mark">Acuarius</span><span className="am-sub">Café &amp; Sabores</span></div></div>
      <h1 className="admin-h">Ingresa a tu panel</h1>
      <form onSubmit={login} className="admin-form">
        <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="admin-btn primary" type="submit">Entrar</button>
        <button type="button" className="admin-forgot" onClick={forgot}>¿Olvidaste tu contraseña?</button>
      </form>
      {msg && <p className="admin-msg">{msg}</p>}
    </div></div>
  );

  if (role !== "admin" && role !== "staff" && role !== "superadmin") return (
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
  const SECTIONS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "pedidos", label: "Pedidos", badge: activos },
    { id: "menu", label: "Menú" },
    { id: "reportes", label: "Reportes" },
    { id: "inventario", label: "Inventario" },
    { id: "reservas", label: "Reservas" },
    { id: "tienda", label: "Tienda" },
    { id: "zonas", label: "Zonas" },
    { id: "clientes", label: "Clientes" },
    { id: "admins", label: "Administradores" },
  ];
  const roleDefault = (rl: string | null, id: string) => {
    if (rl === "superadmin" || rl === "admin") return true;
    if (rl === "staff") return ["dashboard", "pedidos", "menu", "inventario", "reservas", "tienda", "zonas", "clientes"].includes(id);
    return false;
  };
  const effective = (rl: string | null, perms: Record<string, boolean>, id: string) =>
    perms && Object.prototype.hasOwnProperty.call(perms, id) ? !!perms[id] : roleDefault(rl, id);
  const canView = (id: string) => effective(role, myPerms, id);
  const canSeeMoney = role === "admin" || role === "superadmin";
  const isAdmin = role === "admin" || role === "superadmin";
  const NAV = SECTIONS.filter((sx) => canView(sx.id)).map((sx) => ({ id: sx.id, label: sx.label, badge: (sx as { badge?: number }).badge ?? 0 }));
  const visibleSection = canView(section) ? section : (NAV[0]?.id ?? "pedidos");
  const fmtDate = (s: string) => new Date(s).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand2">
          <img src="/logo.jpg" alt="Acuarius" className="adm-logo" />
          <div className="adm-brandtxt"><span className="am-mark">Acuarius</span><span className="am-sub">Café &amp; Sabores</span></div>
        </div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <button key={n.id} className={"adm-navitem" + (section === n.id ? " on" : "")} onClick={() => setSection(n.id)}>
              {n.label}{n.badge ? <span className="adm-badge">{n.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="adm-user"><span>{userEmail}</span><button className="admin-btn ghost sm" onClick={logout}>Salir</button></div>
        <div className="adm-credit"><img src="/maxikia.png" alt="Maxik-IA Technology" /><span>Desarrollado por<br/><b>Maxik-IA Technology</b></span></div>
      </aside>

      <main className="adm-main">
        {msg && <div className="admin-toast">{msg}</div>}

        {visibleSection === "dashboard" && (<>
          <h1 className="adm-title">Buenos momentos 👋</h1>
          <div className="kpis">
            {isAdmin && <div className="kpi"><div className="lbl">Ventas de hoy</div><div className="val">{cop(ventasHoy)}</div></div>}
            <div className="kpi"><div className="lbl">Pedidos hoy</div><div className="val">{pedidosHoy}</div></div>
            <div className="kpi"><div className="lbl">Pedidos activos</div><div className="val">{activos}</div></div>
            {isAdmin
              ? <div className="kpi"><div className="lbl">Miembros Flow</div><div className="val">{clients.length}</div></div>
              : <div className="kpi"><div className="lbl">Listos para entregar</div><div className="val">{orders.filter((o) => o.status === "listo").length}</div></div>}
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Últimos pedidos</h2>
            {orders.length === 0 ? <p className="admin-muted">Aún no hay pedidos.</p> : (
              <table className="adm-table2"><thead><tr><th>Pedido</th><th>Canal</th>{isAdmin && <th>Total</th>}<th>Estado</th><th>Fecha</th></tr></thead>
                <tbody>{orders.slice(0, 8).map((o) => (
                  <tr key={o.id}><td>#{o.id.slice(0, 6)}</td><td>{o.table_number ? "Mesa " + o.table_number : o.channel}</td>{isAdmin && <td>{cop(o.total)}</td>}<td><span className={"st st-" + o.status}>{STATE_LABEL[o.status] || o.status}</span></td><td>{fmtDate(o.created_at)}</td></tr>
                ))}</tbody></table>
            )}
          </div>
        </>)}

        {visibleSection === "pedidos" && (<>
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
                    <button className="admin-btn sm ghost" onClick={() => deleteOrder(o)} title="Eliminar">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Historial (entregados)</h2>
            {orders.filter((o) => o.status === "entregado").length === 0 ? <p className="admin-muted">Sin pedidos entregados aún.</p> :
              <table className="adm-table2"><thead><tr><th>Pedido</th><th>Total</th><th>Fecha</th><th></th></tr></thead>
                <tbody>{orders.filter((o) => o.status === "entregado").slice(0, 20).map((o) => (<tr key={o.id}><td>#{o.id.slice(0, 6)}</td><td>{cop(o.total)}</td><td>{fmtDate(o.created_at)}</td><td><button className="admin-btn sm danger" onClick={() => deleteOrder(o)}>Eliminar</button></td></tr>))}</tbody></table>}
          </div>
        </>)}

        {visibleSection === "menu" && (<>
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
                      {it.image_url ? <img className="am-thumb" src={it.image_url} alt="" /> : <span className="am-thumb empty">📷</span>}
                      <label className="admin-btn sm am-photo">Foto
                        <input type="file" accept="image/*" hidden onChange={(e) => { const fl = e.target.files; if (fl && fl[0]) uploadPhoto(it, fl[0]); }} />
                      </label>
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

        {visibleSection === "reportes" && canView("reportes") && (<>
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

        {visibleSection === "inventario" && (<>
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

        {visibleSection === "reservas" && (<>
          <h1 className="adm-title">Reservas</h1>
          <div className="admin-card">
            {reservations.length === 0 ? <p className="admin-muted">No hay reservas registradas.</p> : (
              <table className="adm-table2"><thead><tr><th>Fecha</th><th>Zona</th><th>Personas</th><th>Estado</th><th></th></tr></thead>
                <tbody>{reservations.map((r) => (
                  <tr key={r.id}><td>{fmtDate(r.reserved_at)}</td><td>{r.reservation_zones?.name ?? "—"}</td><td>{r.party_size}</td>
                    <td><span className={"st st-" + (r.status === "confirmada" ? "listo" : r.status === "cancelada" ? "cancelado" : "nuevo")}>{r.status}</span></td>
                    <td className="am-actions"><button className="admin-btn sm primary" onClick={() => setResStatus(r, "confirmada")}>Confirmar</button><button className="admin-btn sm danger" onClick={() => setResStatus(r, "cancelada")}>Cancelar</button><button className="admin-btn sm ghost" onClick={() => deleteReservation(r)} title="Eliminar">🗑</button></td></tr>
                ))}</tbody></table>
            )}
          </div>
        </>)}

        {visibleSection === "tienda" && (<>
          <h1 className="adm-title">Tienda (kits)</h1>
          <div className="admin-card">
            <h2 className="admin-h2">Agregar kit</h2>
            <div className="am-addgrid am-addgrid5">
              <input placeholder="Nombre del kit" value={pName} onChange={(e) => setPName(e.target.value)} />
              <input type="number" placeholder="Precio" value={pPrice} onChange={(e) => setPPrice(e.target.value)} />
              <input type="number" placeholder="Stock" value={pStock} onChange={(e) => setPStock(e.target.value)} />
              <input placeholder="Descripción" value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
              <button className="admin-btn primary" onClick={addProduct}>Agregar</button>
            </div>
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Kits ({products.length})</h2>
            {products.length === 0 ? <p className="admin-muted">Aún no hay kits. Agrégalos arriba.</p> : (
              <div className="am-table">
                {products.map((x) => (
                  <div className="am-row" style={{ gridTemplateColumns: "auto 1.4fr .7fr .6fr auto", background: x.active ? undefined : "var(--foam)" }} key={x.id}>
                    {x.image_url ? <img className="am-thumb" src={x.image_url} alt="" /> : <span className="am-thumb empty">📦</span>}
                    <input className="am-in" value={x.name} onChange={(e) => patchProduct(x.id, { name: e.target.value })} />
                    <input className="am-in" type="number" value={x.price} onChange={(e) => patchProduct(x.id, { price: Number(e.target.value) })} />
                    <input className="am-in" type="number" value={x.stock} onChange={(e) => patchProduct(x.id, { stock: Number(e.target.value) })} title="Stock" />
                    <div className="am-actions">
                      <label className="admin-btn sm am-photo">Foto<input type="file" accept="image/*" hidden onChange={(e) => { const fl = e.target.files; if (fl && fl[0]) uploadProductPhoto(x, fl[0]); }} /></label>
                      <button className="admin-btn sm" onClick={() => saveProduct(x)}>Guardar</button>
                      <button className="admin-btn sm danger" onClick={() => removeProduct(x)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>)}

        {visibleSection === "zonas" && (<>
          <h1 className="adm-title">Zonas de reserva</h1>
          <div className="admin-card">
            <h2 className="admin-h2">Agregar zona</h2>
            <div className="am-addgrid" style={{ gridTemplateColumns: "1.6fr .8fr auto" }}>
              <input placeholder="Nombre (ej: Terraza)" value={zName} onChange={(e) => setZName(e.target.value)} />
              <input type="number" placeholder="Capacidad" value={zCap} onChange={(e) => setZCap(e.target.value)} />
              <button className="admin-btn primary" onClick={addZone}>Agregar</button>
            </div>
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Zonas ({zones.length})</h2>
            {zones.length === 0 ? <p className="admin-muted">No hay zonas. Agrégalas arriba.</p> : (
              <div className="am-table">
                {zones.map((x) => (
                  <div className="am-row" style={{ gridTemplateColumns: "auto 1.6fr .8fr auto" }} key={x.id}>
                    {x.image_url ? <img className="am-thumb" src={x.image_url} alt="" /> : <span className="am-thumb empty">🪑</span>}
                    <input className="am-in" value={x.name} onChange={(e) => patchZone(x.id, { name: e.target.value })} />
                    <input className="am-in" type="number" value={x.capacity} onChange={(e) => patchZone(x.id, { capacity: Number(e.target.value) })} title="Capacidad" />
                    <div className="am-actions">
                      <label className="admin-btn sm am-photo">Foto<input type="file" accept="image/*" hidden onChange={(e) => { const fl = e.target.files; if (fl && fl[0]) uploadZonePhoto(x, fl[0]); }} /></label>
                      <button className="admin-btn sm" onClick={() => saveZone(x)}>Guardar</button>
                      <button className="admin-btn sm danger" onClick={() => removeZone(x)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>)}

        {visibleSection === "admins" && canView("admins") && (<>
          <h1 className="adm-title">Administradores</h1>
          <div className="admin-card">
            <h2 className="admin-h2">Dar acceso de administrador</h2>
            <p className="admin-muted" style={{ marginBottom: 12 }}>La persona debe haberse registrado antes en la web (con su correo). Aquí le das acceso al panel.</p>
            <div className="am-addgrid" style={{ gridTemplateColumns: "1fr auto" }}>
              <input placeholder="correo@ejemplo.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
              <button className="admin-btn primary" onClick={addAdminByEmail}>Hacer admin</button>
            </div>
          </div>
          <div className="admin-card">
            <h2 className="admin-h2">Usuarios y permisos ({users.length})</h2>
            <p className="admin-muted" style={{ marginBottom: 14 }}>Asigna el rol y, si necesitas, ajusta con los interruptores qué secciones ve cada persona. Los interruptores mandan sobre el rol.</p>
            {users.map((u) => (
              <div className="user-block" key={u.id}>
                <div className="user-head">
                  <div>
                    <div className="user-email">{u.email}</div>
                    <div className="user-name">{u.full_name || "—"} · <span className={"st " + (u.role === "superadmin" ? "st-nuevo" : u.role === "admin" ? "st-listo" : u.role === "staff" ? "st-preparacion" : "st-entregado")}>{u.role}</span></div>
                  </div>
                  {u.role !== "superadmin" && (
                    <div className="am-actions">
                      {u.role !== "admin" && <button className="admin-btn sm primary" onClick={() => setRoleFor(u.email, "admin")}>Admin</button>}
                      {u.role !== "staff" && <button className="admin-btn sm" onClick={() => setRoleFor(u.email, "staff")}>Staff</button>}
                      {u.role !== "customer" && <button className="admin-btn sm danger" onClick={() => setRoleFor(u.email, "customer")}>Quitar acceso</button>}
                    </div>
                  )}
                </div>
                {u.role !== "superadmin" && (u.role === "admin" || u.role === "staff") && (
                  <div className="perm-grid">
                    {SECTIONS.map((sx) => {
                      const on = effective(u.role, u.perms || {}, sx.id);
                      return (
                        <button key={sx.id} className={"perm-chip" + (on ? " on" : "")} onClick={() => setUserPerms(u, sx.id, !on)}>
                          <span className={"perm-dot" + (on ? " on" : "")}></span>{sx.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>)}

        {visibleSection === "clientes" && (<>
          <h1 className="adm-title">Clientes Flow</h1>
          <div className="admin-card">
            {clients.length === 0 ? <p className="admin-muted">Aún no hay clientes registrados.</p> : (
              <table className="adm-table2"><thead><tr><th>Nombre</th><th>Rol</th><th>Nivel</th><th>Puntos</th><th></th></tr></thead>
                <tbody>{clients.map((c) => (<tr key={c.id}><td>{c.full_name || "—"}</td><td>{c.role}</td><td>{c.flow_tier}</td><td style={{ fontWeight: 700 }}>{c.flow_points}</td><td>{c.role !== "admin" && c.role !== "superadmin" && <button className="admin-btn sm danger" onClick={() => deleteClient(c)}>Eliminar</button>}</td></tr>))}</tbody></table>
            )}
          </div>
        </>)}
      </main>
    </div>
  );
}
