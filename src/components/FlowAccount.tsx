"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Profile = { full_name: string | null; flow_points: number; flow_tier: string; total_spent: number };
type Reward = { id: string; name: string; description: string | null; cost_points: number };
type Tx = { id: string; points: number; type: string; created_at: string };

const TIERS = [
  { key: "bronce", label: "Bronce", min: 0, rate: "1x" },
  { key: "plata", label: "Plata", min: 150000, rate: "1,5x" },
  { key: "oro", label: "Oro", min: 400000, rate: "2x" },
];

export default function FlowAccount({ supabaseUrl, supabaseKey }: { supabaseUrl: string; supabaseKey: string }) {
  const [supabase] = useState<SupabaseClient>(() => createClient(supabaseUrl, supabaseKey));
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [msg, setMsg] = useState("");

  // formularios
  const [fullName, setFullName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  // datos
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [txns, setTxns] = useState<Tx[]>([]);

  const flash = (t: string) => { setMsg(t); window.setTimeout(() => setMsg(""), 4000); };

  const loadData = useCallback(async (uid: string) => {
    const [p, r, t] = await Promise.all([
      supabase.from("profiles").select("full_name,flow_points,flow_tier,total_spent").eq("id", uid).single(),
      supabase.from("rewards").select("id,name,description,cost_points").eq("active", true).order("cost_points"),
      supabase.from("flow_transactions").select("id,points,type,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(30),
    ]);
    setProfile((p.data as Profile) ?? null);
    setRewards((r.data as Reward[]) ?? []);
    setTxns((t.data as Tx[]) ?? []);
  }, [supabase]);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) { setLogged(true); await loadData(data.user.id); }
    else setLogged(false);
    setReady(true);
  }, [supabase, loadData]);

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { setRecovery(true); setLogged(false); return; }
      if (session?.user) { setLogged(true); loadData(session.user.id); }
      else { setLogged(false); setProfile(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, [check, supabase, loadData]);

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { flash("Debes autorizar el tratamiento de datos para registrarte."); return; }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, document, whatsapp, data_consent: consent } },
    });
    if (error) { flash("Error: " + error.message); return; }
    // intento de inicio de sesión automático (si no requiere confirmación por correo)
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
    if (e2) { flash("¡Registrado! Revisa tu correo para confirmar tu cuenta y luego inicia sesión."); setMode("login"); return; }
    await check();
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { flash("Error: " + error.message); return; }
    await check();
  };

  const logout = async () => { await supabase.auth.signOut(); setLogged(false); setProfile(null); };

  const forgot = async () => {
    if (!email.trim()) { flash("Escribe tu correo arriba y vuelve a tocar el enlace."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/flow" });
    if (error) { flash("Error: " + error.message); return; }
    flash("Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja (y spam).");
  };

  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) { flash("La contraseña debe tener al menos 6 caracteres."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { flash("Error: " + error.message); return; }
    setRecovery(false); setNewPass("");
    await check();
  };

  const redeem = async (r: Reward) => {
    if (!confirm(`¿Canjear "${r.name}" por ${r.cost_points} puntos?`)) return;
    const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: r.id });
    if (error) { flash("Error: " + error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res.ok) { flash(res.error || "No se pudo canjear."); return; }
    flash("¡Canjeado! Muestra tu cupón en caja. ✓");
    const { data: u } = await supabase.auth.getUser();
    if (u.user) await loadData(u.user.id);
  };

  if (!ready) return <div className="flow-wrap"><p className="muted">Cargando…</p></div>;

  /* ---------- Restablecer contraseña ---------- */
  if (recovery) {
    return (
      <div className="flow-wrap">
        <div className="flow-card">
          <h2 style={{ fontFamily: "var(--font-playfair),serif", fontSize: "1.5rem", marginBottom: "8px" }}>Nueva contraseña</h2>
          <p className="flow-sub">Escribe tu nueva contraseña para tu cuenta Flow.</p>
          <form onSubmit={setNewPassword} className="flow-form">
            <label>Nueva contraseña<input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={6} /></label>
            <button className="btn btn-primary" type="submit">Guardar contraseña</button>
          </form>
          {msg && <p className="flow-msg">{msg}</p>}
        </div>
      </div>
    );
  }

  /* ---------- Niveles (explicación del programa) ---------- */
  const LevelsIntro = (
    <section className="section flow-prog" id="programa">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow" style={{ justifyContent: "center" }}>Programa de lealtad</span>
          <h2>Flow: cada visita suma</h2>
          <p>Acumula puntos con cada pedido y sube de nivel. Entre más fluyes con nosotros, mejores recompensas.</p>
        </div>
        <div className="levels">
          <div className="lvl bronce">
            <span className="tier">Nivel 1</span><h3>Bronce</h3><p className="pts">Desde $0 gastados</p>
            <ul><li>1 punto por cada $1.000</li><li>Bebida gratis de bienvenida</li><li>Postre de cumpleaños</li></ul>
          </div>
          <div className="lvl plata">
            <span className="tier">Nivel 2</span><h3>Plata</h3><p className="pts">Desde $150.000 gastados</p>
            <ul><li>Todo lo de Bronce</li><li>1,5 puntos por cada $1.000</li><li>Reserva prioritaria de mesas</li></ul>
          </div>
          <div className="lvl oro">
            <span className="flag">Más popular</span>
            <span className="tier">Nivel 3</span><h3>Oro</h3><p className="pts">Desde $400.000 gastados</p>
            <ul><li>Todo lo de Plata</li><li>2 puntos por cada $1.000</li><li>Catas y eventos privados</li><li>Zona VIP sin costo</li></ul>
          </div>
        </div>
      </div>
    </section>
  );

  /* ---------- No logueado: registro / login ---------- */
  if (!logged) {
    return (
      <>
      {LevelsIntro}
      <div className="flow-wrap">
        <a href="/" className="flow-back">← Volver al inicio</a>
        <div className="flow-card">
          <div className="flow-tabs">
            <button className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>Crear cuenta</button>
            <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Ingresar</button>
          </div>

          {mode === "register" ? (
            <form onSubmit={doRegister} className="flow-form">
              <h2>Únete a Flow</h2>
              <p className="flow-sub">Gana 1 punto por cada $1.000 y canjea recompensas.</p>
              <label>Nombre completo<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>
              <label>Documento<input value={document} onChange={(e) => setDocument(e.target.value)} required /></label>
              <label>Correo electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
              <label>WhatsApp<input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required /></label>
              <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></label>
              <label className="flow-check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Autorizo el tratamiento de mis datos personales según la política de privacidad (Ley 1581 de 2012).</span>
              </label>
              <button className="btn btn-primary" type="submit">Crear mi cuenta Flow</button>
            </form>
          ) : (
            <form onSubmit={doLogin} className="flow-form">
              <h2>Bienvenido de nuevo</h2>
              <label>Correo electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
              <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
              <button className="btn btn-primary" type="submit">Ingresar</button>
              <button type="button" className="flow-forgot" onClick={forgot}>¿Olvidaste tu contraseña?</button>
            </form>
          )}
          {msg && <p className="flow-msg">{msg}</p>}
        </div>
        <p className="flow-skip">¿Solo quieres pedir? <a href="/">Continúa sin cuenta</a> — igual puedes hacer tu pedido, pero no acumularás puntos.</p>
      </div>
      </>
    );
  }

  /* ---------- Logueado: mi Flow ---------- */
  const pts = profile?.flow_points ?? 0;
  const spent = profile?.total_spent ?? 0;
  const tierIdx = spent >= 400000 ? 2 : spent >= 150000 ? 1 : 0;
  const nextTier = TIERS[tierIdx + 1];
  const toNext = nextTier ? nextTier.min - spent : 0;
  const pct = nextTier ? Math.min(100, Math.round(((spent - TIERS[tierIdx].min) / (nextTier.min - TIERS[tierIdx].min)) * 100)) : 100;
  const cop2 = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="flow-wrap">
      <div className="flow-hero">
        <div className="fh-top">
          <div><div className="fh-hi">Hola,</div><div className="fh-name">{profile?.full_name || "cliente Flow"}</div></div>
          <button className="flow-logout" onClick={logout}>Salir</button>
        </div>
        <div className="fh-tier">★ Nivel {TIERS[tierIdx].label} · ganas {TIERS[tierIdx].rate} puntos</div>
        <div className="fh-pts">{pts.toLocaleString("es-CO")} <small>puntos</small></div>
        <div className="fh-bar"><i style={{ width: pct + "%" }} /></div>
        <div className="fh-next">{nextTier ? `Gasta ${cop2(toNext)} más para llegar a ${nextTier.label} (${nextTier.rate})` : "¡Nivel máximo alcanzado! Ganas 2x puntos"}</div>
      </div>

      {msg && <p className="flow-msg ok">{msg}</p>}

      <h3 className="flow-h3">Canjea tus recompensas</h3>
      <div className="rewards">
        {rewards.length === 0 && <p className="muted">Aún no hay recompensas configuradas.</p>}
        {rewards.map((r) => {
          const can = pts >= r.cost_points;
          return (
            <div className={"reward-card" + (can ? "" : " off")} key={r.id}>
              <div>
                <div className="rc-name">{r.name}</div>
                {r.description && <div className="rc-desc">{r.description}</div>}
              </div>
              <button className="rc-btn" disabled={!can} onClick={() => redeem(r)}>{r.cost_points} pts</button>
            </div>
          );
        })}
      </div>

      <h3 className="flow-h3">Tu historial</h3>
      <div className="flow-hist">
        {txns.length === 0 && <p className="muted">Aún no tienes movimientos. ¡Haz tu primer pedido con tu cuenta para ganar puntos!</p>}
        {txns.map((t) => (
          <div className="hist-row" key={t.id}>
            <span>{t.type === "earn" ? "Puntos ganados" : "Canje de recompensa"}</span>
            <span className={"hist-pts " + (t.points >= 0 ? "pos" : "neg")}>{t.points >= 0 ? "+" : ""}{t.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
