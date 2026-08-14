"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Category = { id: string; name: string };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  featured: boolean;
  active: boolean;
  category_id: string | null;
};

export default function AdminClient({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [supabase] = useState<SupabaseClient>(() =>
    createClient(supabaseUrl, supabaseKey)
  );

  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  // formulario nuevo producto
  const [nName, setNName] = useState("");
  const [nCat, setNCat] = useState("");
  const [nPrice, setNPrice] = useState("");
  const [nDesc, setNDesc] = useState("");

  const flash = (t: string) => {
    setMsg(t);
    window.setTimeout(() => setMsg(""), 3000);
  };

  const loadData = useCallback(async () => {
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from("menu_categories").select("id,name").order("sort_order"),
      supabase
        .from("menu_items")
        .select("id,name,description,price,featured,active,category_id")
        .order("name"),
    ]);
    setCategories((cats as Category[]) ?? []);
    setItems((its as MenuItem[]) ?? []);
    if (cats && (cats as Category[]).length > 0) setNCat((cats as Category[])[0].id);
  }, [supabase]);

  const checkSession = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setUserEmail(null);
      setRole(null);
      setReady(true);
      return;
    }
    setUserEmail(user.email ?? "");
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const r = (prof as { role: string } | null)?.role ?? "customer";
    setRole(r);
    if (r === "admin" || r === "staff") await loadData();
    setReady(true);
  }, [supabase, loadData]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      flash("Error: " + error.message);
      return;
    }
    await checkSession();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setRole(null);
  };

  const addItem = async () => {
    if (!nName || !nPrice) {
      flash("Escribe al menos nombre y precio.");
      return;
    }
    const { error } = await supabase.from("menu_items").insert({
      name: nName,
      category_id: nCat || null,
      price: Number(nPrice),
      description: nDesc || null,
      active: true,
    });
    if (error) {
      flash("No se pudo agregar: " + error.message);
      return;
    }
    setNName("");
    setNPrice("");
    setNDesc("");
    flash("Producto agregado ✓");
    await loadData();
  };

  const patchLocal = (id: string, patch: Partial<MenuItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const saveItem = async (it: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({
        name: it.name,
        description: it.description,
        price: Number(it.price),
        category_id: it.category_id,
        featured: it.featured,
        active: it.active,
      })
      .eq("id", it.id);
    if (error) {
      flash("No se pudo guardar: " + error.message);
      return;
    }
    flash("Guardado ✓");
  };

  const toggle = async (it: MenuItem, field: "active" | "featured") => {
    const value = !it[field];
    patchLocal(it.id, { [field]: value } as Partial<MenuItem>);
    const { error } = await supabase
      .from("menu_items")
      .update({ [field]: value })
      .eq("id", it.id);
    if (error) flash("Error: " + error.message);
  };

  const removeItem = async (it: MenuItem) => {
    if (!confirm(`¿Eliminar "${it.name}"?`)) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", it.id);
    if (error) {
      flash("No se pudo eliminar: " + error.message);
      return;
    }
    flash("Eliminado ✓");
    await loadData();
  };

  const cop = (n: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);

  if (!ready) {
    return (
      <div className="admin-shell">
        <div className="admin-container">
          <p className="admin-muted">Cargando…</p>
        </div>
      </div>
    );
  }

  // --- No autenticado: login ---
  if (!userEmail) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <div className="admin-brand">
            <span className="am-mark">Acuarius</span>
            <span className="am-sub">Admin</span>
          </div>
          <h1 className="admin-h">Ingresa a tu panel</h1>
          <form onSubmit={login} className="admin-form">
            <label>Correo
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" required />
            </label>
            <label>Contraseña
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </label>
            <button className="admin-btn primary" type="submit">Entrar</button>
          </form>
          {msg && <p className="admin-msg">{msg}</p>}
          <p className="admin-hint">Usa la cuenta que creaste en Supabase → Authentication.</p>
        </div>
      </div>
    );
  }

  // --- Autenticado pero sin permisos ---
  if (role !== "admin" && role !== "staff") {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <h1 className="admin-h">Sin permisos de administrador</h1>
          <p className="admin-muted">
            La cuenta <b>{userEmail}</b> no es administradora. En Supabase → SQL Editor ejecuta:
          </p>
          <pre className="admin-pre">{`update public.profiles set role='admin'
where id = (select id from auth.users
where email='${userEmail}');`}</pre>
          <button className="admin-btn ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>
    );
  }

  // --- Panel de administración ---
  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div className="admin-container am-toprow">
          <div className="admin-brand">
            <span className="am-mark">Acuarius</span>
            <span className="am-sub">Admin</span>
          </div>
          <div className="am-user">
            <span>{userEmail}</span>
            <button className="admin-btn ghost sm" onClick={logout}>Salir</button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {msg && <div className="admin-toast">{msg}</div>}

        <div className="admin-card">
          <h2 className="admin-h2">Agregar producto</h2>
          <div className="am-addgrid">
            <input placeholder="Nombre" value={nName} onChange={(e) => setNName(e.target.value)} />
            <select value={nCat} onChange={(e) => setNCat(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input type="number" placeholder="Precio" value={nPrice} onChange={(e) => setNPrice(e.target.value)} />
            <input placeholder="Descripción (opcional)" value={nDesc} onChange={(e) => setNDesc(e.target.value)} />
            <button className="admin-btn primary" onClick={addItem}>Agregar</button>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-h2">Menú ({items.length})</h2>
          <div className="am-table">
            <div className="am-thead">
              <span>Producto</span><span>Categoría</span><span>Precio</span><span>Activo</span><span>Favorito</span><span></span>
            </div>
            {items.map((it) => (
              <div className={"am-row" + (it.active ? "" : " off")} key={it.id}>
                <input className="am-in" value={it.name} onChange={(e) => patchLocal(it.id, { name: e.target.value })} />
                <select className="am-in" value={it.category_id ?? ""} onChange={(e) => patchLocal(it.id, { category_id: e.target.value })}>
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input className="am-in am-price" type="number" value={it.price} onChange={(e) => patchLocal(it.id, { price: Number(e.target.value) })} title={cop(Number(it.price))} />
                <button className={"am-toggle" + (it.active ? " on" : "")} onClick={() => toggle(it, "active")} aria-label="activo"><i></i></button>
                <button className={"am-toggle gold" + (it.featured ? " on" : "")} onClick={() => toggle(it, "featured")} aria-label="favorito"><i></i></button>
                <div className="am-actions">
                  <button className="admin-btn sm" onClick={() => saveItem(it)}>Guardar</button>
                  <button className="admin-btn sm danger" onClick={() => removeItem(it)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
