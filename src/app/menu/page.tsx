import Nav from "@/components/Nav";
import MenuBlock from "@/components/MenuBlock";

export const dynamic = "force-dynamic";
export const metadata = { title: "Acuarius · Carta" };

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const sp = await searchParams;
  const mesaNum = sp?.mesa ? parseInt(sp.mesa, 10) : NaN;
  const mesa = Number.isInteger(mesaNum) && mesaNum >= 1 && mesaNum <= 50 ? mesaNum : null;
  return (
    <>
      <Nav />
      <main className="menu-page" id="top">
        <section className="menu-hero-cream">
          <div className="wrap" style={{ textAlign: "center" }}>
            <a href="/" className="flow-back">← Volver al inicio</a>
            {mesa && <div style={{ marginTop: "10px" }}><span className="mw-badge">📍 Mesa {mesa}</span></div>}
            <span className="eyebrow" style={{ justifyContent: "center" }}>La carta</span>
            <h1>Nuestra carta completa</h1>
            <p className="menu-lead">Explora nuestros seis mundos, arma tu pedido y envíalo{mesa ? ` desde la mesa ${mesa}` : ""}.</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <MenuBlock table={mesa} />
          </div>
        </section>
      </main>
    </>
  );
}
