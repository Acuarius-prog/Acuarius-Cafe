import { useMemo, useState } from 'react'
import { useCart } from '../store/cart'
import { formatMoney } from '../lib/format'
import AnimalDiagram from '../components/AnimalDiagram'
import ProductDrawer from '../components/ProductDrawer'
import { ANIMALES } from '../data/animales'

export default function Animal({ animalKey }) {
  const cart = useCart()
  const animal = useMemo(() => ANIMALES.find((a) => a.key === animalKey), [animalKey])
  const [tipo, setTipo] = useState(animal?.tipos?.[0] || null)
  const [selected, setSelected] = useState(null)

  if (!animal) return <div className="admin-wrap"><p>Animal no encontrado.</p></div>

  const mult = tipo?.mult || 1
  const precio = (cut) => Math.round(cut.price * mult)

  // Construye el "producto" para el pedido, incluyendo el tipo (pollo).
  const toProducto = (cut) => ({
    id: `${animal.key}:${cut.slug}${tipo ? ':' + tipo.key : ''}`,
    slug: cut.slug,
    name: tipo ? `${cut.name} (${tipo.label})` : cut.name,
    price: precio(cut),
    unit: cut.unit || 'kg',
    unitLabel: cut.unit === 'kg' ? 'kg' : (cut.unitLabel || 'unidad'),
    description: cut.description || '',
  })

  return (
    <>
      <section className="hero animal-hero">
        <div className="hero-copy">
          <h1>{animal.label}</h1>
          <p className="lede">Toca un corte en la imagen o en la lista, elige la cantidad y súmalo a tu pedido.</p>
        </div>

        {animal.tipos && (
          <div className="tipos" role="radiogroup" aria-label="Tipo de ave">
            {animal.tipos.map((t) => (
              <button key={t.key} className={'tipo' + (tipo?.key === t.key ? ' active' : '')} onClick={() => setTipo(t)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <AnimalDiagram animal={animal} precio={precio} onSelect={(cut) => setSelected(toProducto(cut))} />
      </section>

      <section className="cuts" aria-label={`Cortes de ${animal.label}`}>
        <h2 className="section-title">Cortes de {animal.label.toLowerCase()}{tipo ? ` · ${tipo.label}` : ''}</h2>
        <div className="cut-grid">
          {animal.cuts.map((c) => (
            <button className="cut-card" key={c.slug} onClick={() => setSelected(toProducto(c))}>
              <div className="cut-card-top"><span className="cut-card-name">{c.name}</span></div>
              {c.description && <p className="cut-card-desc">{c.description}</p>}
              <div className="cut-card-foot">
                <span className="cut-card-price">{formatMoney(precio(c))} <em>/ {c.unit === 'kg' ? 'kg' : (c.unitLabel || 'unidad')}</em></span>
                <span className="cut-card-cta">Pedir</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <ProductDrawer producto={selected} onClose={() => setSelected(null)} onAdd={cart.add} />
    </>
  )
}
