import Nav from "@/components/Nav";
import MenuSummary from "@/components/MenuSummary";
import ReservaForm from "@/components/ReservaForm";
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
  const supaUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supaKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    <>
      <div className="topstrip">
        🌿 <b>Buenos momentos, siempre</b> · Fontibón, Bogotá · Abierto hoy 7:00 a.m. – 11:00 p.m.
      </div>

      <Nav />

      <main id="top">
        <div className="home-corners" aria-hidden="true">
          <img src="/esq-tl.png" className="hc hc-tl" alt="" />
          <img src="/esq-tr.png" className="hc hc-tr" alt="" />
          <img src="/esq-bl.png" className="hc hc-bl" alt="" />
          <img src="/esq-br.png" className="hc hc-br" alt="" />
        </div>
        {mesa && (
          <section className="mesa-welcome">
            <div className="wrap">
              <span className="mw-badge">📍 Mesa {mesa}</span>
              <h2>¡Bienvenido a Acuarius!</h2>
              <p>Estás en la mesa {mesa}. Arma tu pedido desde tu celular, sin esperar al mesero.</p>
              <a href={`/menu?mesa=${mesa}`} className="btn btn-primary">Ver la carta</a>
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
                <a href="/menu" className="btn btn-primary">Ver el menú</a>
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

        {/* MENU (resumen) */}
        <section className="section menu-band" id="menu">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">La carta</span>
              <h2>Una barra, seis mundos por explorar</h2>
              <p>Explora nuestras categorías y descubre la carta completa.</p>
            </div>
            <MenuSummary />
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

        {/* RESERVAS */}
        <section className="section reserva-band" id="reservas">
          <div className="wrap reserva-grid2">
            <div className="reserva-intro">
              <span className="eyebrow">Reservas en tiempo real</span>
              <h2 style={{ fontSize: "clamp(2rem,3.8vw,3rem)", margin: ".35em 0 .5em" }}>Reserva tu mesa</h2>
              <p style={{ color: "var(--muted)", fontSize: "1.06rem", marginBottom: "1.2em" }}>Elige tu zona favorita, la fecha y la hora. Verificamos disponibilidad al instante y confirmamos por WhatsApp.</p>
              <ul className="reserva-benefits">
                <li>Confirmación rápida por WhatsApp</li>
                <li>Elige terraza, interior, barra o zona VIP</li>
                <li>Sin cuenta: solo tus datos y listo</li>
              </ul>
            </div>
            {supaUrl && supaKey
              ? <ReservaForm supabaseUrl={supaUrl} supabaseKey={supaKey} whatsapp="573125487857" />
              : <p className="carta-note">Conecta Supabase para activar las reservas.</p>}
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
            <div className="foot-col"><h5>Explorar</h5><a href="#menu">Menú</a><a href="#flowmatch">Flow Match</a><a href="/flow">Mi Flow</a><a href="/tienda">Tienda</a></div>
            <div className="foot-col"><h5>Visítanos</h5><p>Calle 99 No. 20C-62<br/>Fontibón Centro, Bogotá D.C.</p><p>Lun – Dom<br />7:00 a.m. – 11:00 p.m.</p><p>Tel. 312 548 7857</p></div>
            <div className="foot-col"><h5>Síguenos</h5><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">WhatsApp</a></div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Acuarius Café &amp; Sabores. Todos los derechos reservados.</span>
            <span className="credit"><img src="/maxikia.png" alt="Maxik-IA Technology" className="credit-logo" /> Desarrollada por <b>Maxik-IA&nbsp;Technology</b></span>
          </div>
        </div>
      </footer>
    </>
  );
}
