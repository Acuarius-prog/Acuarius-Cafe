import { useEffect, useState } from 'react'
import { Link } from '../router'
import { CONFIG } from '../config'
import {
  hasSupabase, adminSignIn, adminSignOut, getSession, onAuthChange,
  fetchAllProducts, updateProduct, insertProduct, deleteProduct,
} from '../lib/supabase'
import { formatMoney } from '../lib/format'
import { CORTES } from '../data/cortes'
import { OTROS } from '../data/otros'

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ---- Sin Supabase: aviso + precios locales de solo lectura ----------------
function SinBackend() {
  return (
    <div className="admin-wrap">
      <div className="admin-note">
        <h2>Panel de precios</h2>
        <p>Para <strong>editar precios desde la web</strong> necesitas conectar Supabase (base de datos gratuita). Mientras tanto, los precios se editan en los archivos <code>src/data/cortes.js</code> y <code>src/data/otros.js</code>.</p>
        <p>Pasos resumidos (ver <code>DEPLOY.md</code>): crea un proyecto en Supabase, ejecuta <code>schema.sql</code> y <code>seed.sql</code>, y agrega las variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en Cloudflare. Luego crea tu usuario en Supabase → Authentication.</p>
      </div>
      <h3 className="admin-sub">Precios actuales (solo lectura)</h3>
      <table className="admin-table">
        <thead><tr><th>Producto</th><th>Precio</th><th>Tipo</th></tr></thead>
        <tbody>
          {CORTES.map((c) => (<tr key={c.slug}><td>{c.name}</td><td>{formatMoney(c.pricePerKg)}</td><td>/ kg (cerdo)</td></tr>))}
          {OTROS.map((p) => (<tr key={p.slug}><td>{p.name}</td><td>{formatMoney(p.price)}</td><td>/ {p.unit === 'kg' ? 'kg' : (p.unitLabel || 'unidad')} (otros)</td></tr>))}
        </tbody>
      </table>
      <p className="admin-back"><Link to="/">← Volver a la tienda</Link></p>
    </div>
  )
}

// ---- Login ----------------------------------------------------------------
function Login({ onDone }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { await adminSignIn(email.trim(), pw); onDone() }
    catch { setErr('Correo o contraseña incorrectos.') }
    finally { setBusy(false) }
  }
  return (
    <div className="admin-wrap">
      <form className="admin-login" onSubmit={submit}>
        <h2>Panel de precios</h2>
        <p className="admin-muted">Ingresa con tu cuenta de administrador.</p>
        <label className="field"><span>Correo</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label className="field"><span>Contraseña</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></label>
        {err && <p className="warn">{err}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <p className="admin-back"><Link to="/">← Volver a la tienda</Link></p>
      </form>
    </div>
  )
}

// ---- Editor ----------------------------------------------------------------
function Editor({ onLogout }) {
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState({})
  const [error, setError] = useState('')
  const [nuevo, setNuevo] = useState({ name: '', price: '', unit: 'unidad', unit_label: 'unidad', description: '' })

  const load = () => fetchAllProducts().then(setRows).catch(() => setError('No se pudieron cargar los productos.'))
  useEffect(() => { load() }, [])

  const setField = (id, field, value) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

  const save = async (r) => {
    setStatus((s) => ({ ...s, [r.id]: 'saving' }))
    try {
      await updateProduct(r.id, {
        name: r.name,
        price_per_kg: Math.round(Number(r.price_per_kg) || 0),
        description: r.description,
        active: r.active,
        unit: r.unit,
        unit_label: r.unit_label,
      })
      setStatus((s) => ({ ...s, [r.id]: 'ok' }))
      setTimeout(() => setStatus((s) => ({ ...s, [r.id]: undefined })), 1500)
    } catch { setStatus((s) => ({ ...s, [r.id]: 'err' })) }
  }

  const add = async () => {
    if (!nuevo.name.trim() || !nuevo.price) return
    try {
      await insertProduct({
        slug: slugify(nuevo.name) + '-' + Math.random().toString(36).slice(2, 6),
        name: nuevo.name.trim(),
        price_per_kg: Math.round(Number(nuevo.price) || 0),
        description: nuevo.description,
        category: 'otros',
        unit: nuevo.unit,
        unit_label: nuevo.unit === 'kg' ? 'kg' : (nuevo.unit_label || 'unidad'),
        active: true,
        sort: 999,
      })
      setNuevo({ name: '', price: '', unit: 'unidad', unit_label: 'unidad', description: '' })
      load()
    } catch { setError('No se pudo agregar el producto.') }
  }

  const del = async (r) => {
    if (!confirm(`¿Eliminar "${r.name}"?`)) return
    try { await deleteProduct(r.id); load() } catch { setError('No se pudo eliminar.') }
  }

  if (error) return <div className="admin-wrap"><p className="warn">{error}</p></div>
  if (!rows) return <div className="admin-wrap"><p className="admin-muted">Cargando…</p></div>

  const cerdo = rows.filter((r) => r.category !== 'otros')
  const otros = rows.filter((r) => r.category === 'otros')

  const Row = (r) => (
    <tr key={r.id}>
      <td><input className="ad-in" value={r.name} onChange={(e) => setField(r.id, 'name', e.target.value)} /></td>
      <td className="ad-price">
        <input className="ad-in ad-num" type="number" value={r.price_per_kg}
          onChange={(e) => setField(r.id, 'price_per_kg', e.target.value)} />
        <span>{r.category === 'otros' && r.unit !== 'kg' ? `/ ${r.unit_label || 'unidad'}` : '/ kg'}</span>
      </td>
      <td><input type="checkbox" checked={!!r.active} onChange={(e) => setField(r.id, 'active', e.target.checked)} /></td>
      <td className="ad-actions">
        <button className="ad-save" onClick={() => save(r)}>
          {status[r.id] === 'saving' ? '…' : status[r.id] === 'ok' ? '✓' : status[r.id] === 'err' ? '⚠' : 'Guardar'}
        </button>
        {r.category === 'otros' && <button className="ad-del" onClick={() => del(r)}>Eliminar</button>}
      </td>
    </tr>
  )

  return (
    <div className="admin-wrap">
      <div className="admin-top">
        <h2>Panel de precios</h2>
        <button className="btn-ghost ad-logout" onClick={onLogout}>Cerrar sesión</button>
      </div>

      <h3 className="admin-sub">Cortes de cerdo</h3>
      <table className="admin-table">
        <thead><tr><th>Producto</th><th>Precio</th><th>Activo</th><th></th></tr></thead>
        <tbody>{cerdo.map(Row)}</tbody>
      </table>

      <h3 className="admin-sub">Otros productos</h3>
      <table className="admin-table">
        <thead><tr><th>Producto</th><th>Precio</th><th>Activo</th><th></th></tr></thead>
        <tbody>{otros.map(Row)}</tbody>
      </table>

      <div className="admin-add">
        <h4>Agregar otro producto</h4>
        <div className="admin-add-grid">
          <input className="ad-in" placeholder="Nombre" value={nuevo.name} onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })} />
          <input className="ad-in ad-num" type="number" placeholder="Precio" value={nuevo.price} onChange={(e) => setNuevo({ ...nuevo, price: e.target.value })} />
          <select className="ad-in" value={nuevo.unit} onChange={(e) => setNuevo({ ...nuevo, unit: e.target.value })}>
            <option value="unidad">Por unidad</option>
            <option value="kg">Por kilo</option>
          </select>
          {nuevo.unit !== 'kg' && (
            <input className="ad-in" placeholder="Etiqueta (unidad, cubeta, bolsa…)" value={nuevo.unit_label} onChange={(e) => setNuevo({ ...nuevo, unit_label: e.target.value })} />
          )}
          <input className="ad-in" placeholder="Descripción (opcional)" value={nuevo.description} onChange={(e) => setNuevo({ ...nuevo, description: e.target.value })} />
          <button className="btn-primary ad-addbtn" onClick={add}>Agregar</button>
        </div>
      </div>

      <p className="admin-back"><Link to="/">← Volver a la tienda</Link></p>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!hasSupabase) { setReady(true); return }
    getSession().then((s) => { setSession(s); setReady(true) })
    const off = onAuthChange((s) => setSession(s))
    return off
  }, [])

  if (!hasSupabase) return <SinBackend />
  if (!ready) return <div className="admin-wrap"><p className="admin-muted">Cargando…</p></div>
  if (!session) return <Login onDone={() => getSession().then(setSession)} />
  return <Editor onLogout={async () => { await adminSignOut(); setSession(null) }} />
}
