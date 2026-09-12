import { useState } from 'react'
import { formatMoney } from '../lib/format'

// Diagrama interactivo genérico: muestra la imagen del animal y superpone las
// zonas de cada corte. Al pasar/tocar resalta; al hacer clic, abre el pedido.
export default function AnimalDiagram({ animal, precio, onSelect }) {
  const [hover, setHover] = useState(null)
  const { w, h, src } = animal.image
  const hovered = hover ? animal.cuts.find((c) => c.slug === hover) : null

  return (
    <div className="pig-wrap">
      <div className="pig-stage">
        <svg className="pig-svg" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={`Cortes de ${animal.label}. Toca uno para pedirlo.`}>
          <image href={src} x="0" y="0" width={w} height={h} />
          <g className="regions">
            {animal.cuts.map((c) => (
              <polygon
                key={c.slug}
                className={'region' + (hover === c.slug ? ' on' : '')}
                points={c.hotspot}
                tabIndex={0}
                role="button"
                aria-label={`${c.name}, ${formatMoney(precio(c))} por kilo. Pedir`}
                onMouseEnter={() => setHover(c.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(c.slug)}
                onBlur={() => setHover(null)}
                onClick={() => onSelect(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c) } }}
              />
            ))}
          </g>
        </svg>
        <span className={'piece-tip' + (hovered ? ' show' : '')} aria-hidden="true">
          {hovered ? (<><strong>{hovered.name}</strong><span>{formatMoney(precio(hovered))} / kg</span></>) : 'Toca un corte'}
        </span>
      </div>
      <p className="pig-hint">Toca un corte en la imagen para pedirlo</p>
    </div>
  )
}
