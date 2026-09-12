import { createClient } from '@supabase/supabase-js'
import { CORTES } from '../data/cortes'
import { OTROS } from '../data/otros'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const hasSupabase = Boolean(supabase)

// ---- Cortes de cerdo (combina precio de BD con la geometría local) --------
export async function fetchCortes() {
  if (!supabase) return CORTES
  try {
    const { data, error } = await supabase
      .from('products')
      .select('slug, name, price_per_kg, methods, description')
      .eq('active', true)
    if (error || !data?.length) throw error || new Error('sin datos')
    const geoBySlug = Object.fromEntries(CORTES.map((c) => [c.slug, c]))
    const merged = data
      .filter((row) => geoBySlug[row.slug]) // solo los que tienen geometría (cerdo)
      .map((row) => ({
        ...geoBySlug[row.slug],
        name: row.name,
        pricePerKg: row.price_per_kg,
        methods: row.methods || geoBySlug[row.slug].methods,
        description: row.description || geoBySlug[row.slug].description,
      }))
    return merged.length ? merged : CORTES
  } catch {
    return CORTES
  }
}

// ---- Otros productos ------------------------------------------------------
export async function fetchOtros() {
  if (!supabase) return OTROS
  try {
    const { data, error } = await supabase
      .from('products')
      .select('slug, name, price_per_kg, unit, unit_label, description')
      .eq('active', true)
      .eq('category', 'otros')
      .order('sort', { ascending: true })
    if (error) throw error
    if (!data?.length) return OTROS
    return data.map((row) => ({
      slug: row.slug,
      name: row.name,
      price: row.price_per_kg,
      unit: row.unit || 'unidad',
      unitLabel: row.unit_label || (row.unit === 'kg' ? 'kg' : 'unidad'),
      description: row.description || '',
    }))
  } catch {
    return OTROS
  }
}

// ---- Pedidos --------------------------------------------------------------
export async function saveOrder(order) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: order.name,
      phone: order.phone,
      delivery_type: order.deliveryType,
      address: order.address,
      neighborhood: order.neighborhood,
      notes: order.notes,
      payment_method: order.paymentMethod,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      total: order.total,
      status: 'nuevo',
    })
    .select('id')
    .single()
  if (error) throw error

  const items = order.items.map((it) => {
    const weight = it.kind !== 'unit'
    const lt = Math.round(weight ? it.pricePerKg * it.kg : it.unitPrice * it.qty)
    return {
      order_id: data.id,
      product_slug: it.id,
      product_name: it.name,
      kind: it.kind,
      qty_kg: weight ? it.kg : null,
      qty_units: weight ? null : it.qty,
      unit_label: it.unitLabel || null,
      unit_price: weight ? it.pricePerKg : it.unitPrice,
      unit_price_kg: weight ? it.pricePerKg : null,
      line_total: lt,
    }
  })
  const { error: itemsError } = await supabase.from('order_items').insert(items)
  if (itemsError) throw itemsError
  return { id: data.id }
}

// ====================== ADMINISTRACIÓN (panel) =============================
export async function adminSignIn(email, password) {
  if (!supabase) throw new Error('Supabase no configurado')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}
export async function adminSignOut() {
  if (supabase) await supabase.auth.signOut()
}
export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}
export function onAuthChange(cb) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session))
  return () => data.subscription.unsubscribe()
}
export async function fetchAllProducts() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, price_per_kg, description, category, unit, unit_label, active, sort')
    .order('category', { ascending: true })
    .order('sort', { ascending: true })
  if (error) throw error
  return data
}
export async function updateProduct(id, fields) {
  const { error } = await supabase.from('products').update(fields).eq('id', id)
  if (error) throw error
}
export async function insertProduct(fields) {
  const { data, error } = await supabase.from('products').insert(fields).select('id').single()
  if (error) throw error
  return data
}
export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
