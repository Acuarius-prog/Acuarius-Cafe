import { Link } from '../router'
import { CONFIG } from '../config'
import { ANIMALES } from '../data/animales'

export default function Landing() {
  return (
    <>
      <section className="hero landing-hero">
        <div className="hero-copy">
          <h1>Carne fresca de res, pollo y cerdo</h1>
          <p className="lede">Elige la sección, toca el corte que quieres, pídelo por libras o kilos y recíbelo a domicilio. {CONFIG.contact.address.split(',')[0]}.</p>
        </div>
      </section>

      <section className="cuts">
        <div className="landing-grid">
          {ANIMALES.map((a) => (
            <Link key={a.key} to={`/${a.key}`} className="landing-card">
              <span className="landing-emoji" aria-hidden="true">{a.emoji}</span>
              <span className="landing-name">{a.label}</span>
              <span className="landing-sub">{a.cuts.length} cortes</span>
            </Link>
          ))}
          <Link to="/tienda" className="landing-card">
            <span className="landing-emoji" aria-hidden="true">🛒</span>
            <span className="landing-name">Mini tienda</span>
            <span className="landing-sub">Otros productos</span>
          </Link>
        </div>
      </section>
    </>
  )
}
