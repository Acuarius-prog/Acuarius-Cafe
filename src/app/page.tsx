import Nav from "@/components/Nav";
import MenuBlock from "@/components/MenuBlock";
import FlowMatch from "@/components/FlowMatch";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mesa?: string }>;
}) {
  const sp = await searchParams;
  const mesaNum = sp?.mesa ? parseInt(sp.mesa, 10) : NaN;
  const mesa = Number.isInteger(mesaNum) && mesaNum >= 1 && mesaNum <= 50 ? mesaNum : null;
  return (
    <>
      <div className="topstrip">
        🌿 <b>Buenos momentos, siempre</b> · Fontibón, Bogotá · Abierto hoy 7:00 a.m. – 11:00 p.m.
      </div>

      <Nav />

      <main id="top">
        {mesa && (
          <section className="mesa-welcome">
            <div className="wrap">
              <span className="mw-badge">📍 Mesa {mesa}</span>
              <h2>¡Bienvenido a Acuarius!</h2>
              <p>Estás en la mesa {mesa}. Arma tu pedido desde tu celular, sin esperar al mesero.</p>
              <a href="#menu" className="btn btn-primary">Ver la carta</a>
            </div>
          </section>
        )}

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow" aria-hidden="true"></div>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Café de especialidad</span>
              <h1>Buenos momentos,<br /><span className="accent">servidos a tu ritmo.</span></h1>
              <p className="lead">Café de origen, tés, jugos prensados en frío, postres de autor, coctelería y cerveza artesanal. Seis mundos, una misma barra.</p>
              <div className="hero-actions">
                <a href="#menu" className="btn btn-primary">Ver el menú</a>
                <a href="#flowmatch" className="btn btn-ghost">Descubre tu bebida ideal</a>
              </div>
              <div className="hero-tags">
                <span>Cafés</span><span>Tés</span><span>Jugos naturales</span><span>Postres</span><span>Cócteles</span><span>Cerveza artesanal</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="ring">
                <img src="/logo.jpg" alt="Logo de Acuarius Café & Sabores" width={430} height={430} />
              </div>
              <div className="badge b1"><span className="num">6</span><span className="lbl">categorías<br />en una carta</span></div>
              <div className="badge b2"><span className="num">Flow</span><span className="lbl">gana puntos<br />en cada visita</span></div>
            </div>
          </div>
        </section>

        {/* MENU */}
        <section className="section menu-band" id="menu">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">La carta</span>
              <h2>Una barra, seis mundos por explorar</h2>
              <p>Toca una categoría para filtrar, arma tu pedido y envíalo.</p>
            </div>
            <MenuBlock table={mesa} />
          </div>
        </section>

        {/* FLOW MATCH */}
        <section className="section flow-band" id="flowmatch">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow" style={{ justifyContent: "center" }}>Flow Match · IA</span>
              <h2>¿No sabes qué pedir? Deja que el flow te encuentre.</h2>
              <p>Cinco preguntas rápidas y te recomendamos la bebida perfecta para este momento.</p>
            </div>
            <FlowMatch />
          </div>
        </section>

        {/* PROGRAMA FLOW */}
        <section className="section flow-prog" id="programa">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Programa de lealtad</span>
              <h2>Niveles Flow: cada visita suma</h2>
              <p>Acumula puntos con cada pedido y sube de nivel. Entre más fluyes con nosotros, mejores recompensas.</p>
            </div>
            <div className="levels">
              <div className="lvl bronce">
                <span className="tier">Nivel 1</span><h3>Bronce</h3><p className="pts">0 – 499 puntos</p>
                <ul><li>1 punto por cada $1.000</li><li>Bebida gratis de bienvenida</li><li>Postre de cumpleaños</li></ul>
              </div>
              <div className="lvl plata">
                <span className="tier">Nivel 2</span><h3>Plata</h3><p className="pts">500 – 1.499 puntos</p>
                <ul><li>Todo lo de Bronce</li><li>1,5 puntos por cada $1.000</li><li>Reserva prioritaria de mesas</li></ul>
              </div>
              <div className="lvl oro">
                <span className="flag">Más popular</span>
                <span className="tier">Nivel 3</span><h3>Oro</h3><p className="pts">1.500+ puntos</p>
                <ul><li>Todo lo de Plata</li><li>2 puntos por cada $1.000</li><li>Catas y eventos privados</li><li>Zona VIP sin costo</li></ul>
              </div>
            </div>
          </div>
        </section>

        {/* RESERVAS */}
        <section className="section reserva-band" id="reservas">
          <div className="wrap reserva-grid">
            <div>
              <span className="eyebrow">Reservas en tiempo real</span>
              <h2 style={{ fontSize: "clamp(2rem,3.8vw,3rem)", margin: ".35em 0 .5em" }}>Elige tu rincón favorito</h2>
              <p style={{ color: "var(--muted)", fontSize: "1.06rem", marginBottom: "1.8em" }}>Calendario interactivo y disponibilidad al instante. Escoge la zona, la hora y el número de personas.</p>
              <a href="#" className="btn btn-primary">Reservar una mesa</a>
            </div>
            <div className="zones">
              <div className="zone"><h4>Terraza</h4><p>Al aire libre, ideal para las tardes.</p><span className="cap">Hasta 6 personas</span></div>
              <div className="zone"><h4>Interior</h4><p>Ambiente cálido y luz tenue.</p><span className="cap">Hasta 8 personas</span></div>
              <div className="zone"><h4>Barra</h4><p>Cerca de la acción, para curiosos.</p><span className="cap">Hasta 4 personas</span></div>
              <div className="zone"><h4>Zona VIP</h4><p>Reservada, para ocasiones especiales.</p><span className="cap">Hasta 12 personas</span></div>
            </div>
          </div>
        </section>

        {/* TIENDA */}
        <section className="section" id="tienda">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Tienda online</span>
              <h2>Llévate el ritual a casa</h2>
              <p>Kits curados por nuestro equipo para que recrees tus favoritos donde estés.</p>
            </div>
            <div className="kits">
              <article className="kit k1"><div className="top">☕</div><div className="body"><h3>Kit Barista</h3><p>Grano de origen, prensa francesa, molino y guía.</p><div className="row"><span className="kprice">$149.000</span><a href="#" className="btn btn-ghost">Añadir</a></div></div></article>
              <article className="kit k2"><div className="top">🍸</div><div className="body"><h3>Kit Coctelero</h3><p>Coctelera, jigger, mezclador y recetario de barra.</p><div className="row"><span className="kprice">$189.000</span><a href="#" className="btn btn-ghost">Añadir</a></div></div></article>
              <article className="kit k3"><div className="top">🥤</div><div className="body"><h3>Kit Detox</h3><p>Jugos prensados, tés botánicos y plan de 3 días.</p><div className="row"><span className="kprice">$99.000</span><a href="#" className="btn btn-ghost">Añadir</a></div></div></article>
            </div>
          </div>
        </section>

        {/* VISITANOS */}
        <section className="section visita-band" id="visitanos">
          <div className="wrap visita-grid">
            <div className="visita-photo">
              <img src="/local.jpg" alt="Fachada e interior de Acuarius Café en Fontibón" width={1200} height={903} />
              <span className="chip">📍 Tu lugar favorito en Fontibón</span>
            </div>
            <div className="visita-info">
              <span className="eyebrow">Visítanos</span>
              <h2>Te esperamos en Fontibón</h2>
              <p className="lead">Un espacio cálido para quedarte: café recién hecho, buena mesa y la mejor compañía. Pásate a probar nuestro Carajillo, el favorito de la casa.</p>
              <div className="info-list">
                <div className="info-item"><div><div className="k">Ubicación</div><div className="v">Calle 99 No. 20C-62, Fontibón Centro, Bogotá D.C.</div></div></div>
                <div className="info-item"><div><div className="k">Horario</div><div className="v">Lunes a domingo · 7:00 a.m. – 11:00 p.m.</div></div></div>
                <div className="info-item"><div><div className="k">Reservas y pedidos</div><div className="v">312 548 7857</div></div></div>
              </div>
              <div className="visita-actions">
                <a href="https://maps.google.com/?q=Calle+99+20C-62+Fontibon+Centro+Bogota" target="_blank" rel="noopener" className="btn btn-primary">Cómo llegar</a>
                <a href="https://wa.me/573125487857" target="_blank" rel="noopener" className="btn btn-ghost">WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        {/* BANQUITA */}
        <section className="section banca-band" id="banca">
          <div className="wrap banca-grid">
            <div className="banca-info">
              <span className="eyebrow">Tu rinconcito</span>
              <h2>La banquita para tus fotos</h2>
              <p className="lead">Creamos un espacio pensado para ti: siéntate, relájate y llévate la fotico del recuerdo. Porque en Acuarius cada visita es un buen momento para compartir.</p>
              <a href="#visitanos" className="btn btn-primary">Ven a estrenarla</a>
            </div>
            <div className="banca-photo">
              <img src="/banca.jpg" alt="Banca turquesa para fotos en Acuarius Café, rodeada de plantas" />
              <span className="chip">📸 Llévate tu recuerdo</span>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="section story">
          <div className="wrap">
            <p className="quote">“Un lugar para <span className="g">cada antojo</span>, a cualquier hora del día.”</p>
            <p className="by">Acuarius Café &amp; Sabores</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="foot-brand">
                <span className="fb-name">Acuarius</span>
                <span className="fb-sub">Café &amp; Sabores</span>
                <span className="fb-slogan">Buenos momentos, siempre.</span>
              </div>
              <p className="fdesc">Café de especialidad en Fontibón, Bogotá. Cafés, tés, jugos, postres, coctelería y cerveza artesanal.</p>
            </div>
            <div className="foot-col"><h5>Explorar</h5><a href="#menu">Menú</a><a href="#flowmatch">Flow Match</a><a href="#programa">Programa Flow</a><a href="#tienda">Tienda</a></div>
            <div className="foot-col"><h5>Visítanos</h5><p>Calle 99 No. 20C-62<br/>Fontibón Centro, Bogotá D.C.</p><p>Lun – Dom<br />7:00 a.m. – 11:00 p.m.</p><p>Tel. 312 548 7857</p></div>
            <div className="foot-col"><h5>Síguenos</h5><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">WhatsApp</a></div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Acuarius Café &amp; Sabores. Todos los derechos reservados.</span>
            <span className="credit"><img src="/maxikia.png" alt="Maxik-IA Technology" className="credit-logo" /> Desarrollada por <b>Maxik-IA Technology</b></span>
          </div>
        </div>
      </footer>
    </>
  );
}
