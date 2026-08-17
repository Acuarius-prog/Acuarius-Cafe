import Nav from "@/components/Nav";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Acuarius · Tienda" };

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

type Product = { id: string; name: string; description: string | null; price: number; image_url: string | null };

export default async function TiendaPage() {
  const supabase = getSupabase();
  let products: Product[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("products")
      .select("id,name,description,price,image_url")
      .eq("active", true)
      .order("name");
    products = (data as Product[]) ?? [];
  }

  return (
    <>
      <Nav />
      <main className="tienda-page">
        <section className="tienda-hero">
          <div className="wrap" style={{ textAlign: "center" }}>
            <a href="/" className="flow-back light">← Volver al inicio</a>
            <span className="eyebrow" style={{ justifyContent: "center", color: "var(--gold)" }}>Tienda online</span>
            <h1>Llévate el ritual a casa</h1>
            <p className="tienda-lead">Kits y productos curados por nuestro equipo para que disfrutes Acuarius donde estés.</p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            {products.length === 0 ? (
              <p className="carta-note">Pronto tendremos productos disponibles. Agrégalos desde el panel <code>/admin → Tienda</code>.</p>
            ) : (
              <div className="tienda-grid">
                {products.map((p) => (
                  <article key={p.id} className="tienda-card">
                    {p.image_url ? (
                      <div className="tc-photo"><img src={p.image_url} alt={p.name} loading="lazy" /></div>
                    ) : (
                      <div className="tc-photo tc-empty">🛍️</div>
                    )}
                    <div className="tc-body">
                      <h3>{p.name}</h3>
                      {p.description && <p>{p.description}</p>}
                      <div className="tc-foot">
                        <span className="tc-price">{cop(Number(p.price))}</span>
                        <a
                          className="btn btn-primary tc-btn"
                          href={`https://wa.me/573125487857?text=${encodeURIComponent("¡Hola Acuarius! Quiero pedir: " + p.name)}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Pedir
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
