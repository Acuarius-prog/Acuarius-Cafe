import { getSupabase } from "@/lib/supabase/server";

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

type Category = { id: string; name: string; slug: string; sort_order: number };
type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  featured: boolean;
  category_id: string | null;
};

export default async function Menu() {
  const supabase = getSupabase();

  if (!supabase) {
    return (
      <p className="carta-note">
        Conecta Supabase (variables <code>SUPABASE_URL</code> y{" "}
        <code>SUPABASE_ANON_KEY</code>) para mostrar la carta completa aquí.
      </p>
    );
  }

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("id,name,slug,sort_order").eq("active", true).order("sort_order"),
    supabase.from("menu_items").select("id,name,description,price,featured,category_id").eq("active", true).order("name"),
  ]);

  if (!categories || !items || items.length === 0) {
    return (
      <p className="carta-note">
        Aún no hay productos cargados. Ejecuta el script SQL en Supabase o agrega
        productos desde la tabla <code>menu_items</code>.
      </p>
    );
  }

  return (
    <div className="carta">
      {categories.map((cat: Category) => {
        const list = items.filter((i: Item) => i.category_id === cat.id);
        if (list.length === 0) return null;
        return (
          <section key={cat.id} className="carta-cat">
            <h3 className="cc-title">{cat.name}</h3>
            <div className="carta-items">
              {list.map((item: Item) => (
                <article key={item.id} className={"carta-item" + (item.featured ? " feat" : "")}>
                  <div>
                    <h4>
                      {item.name}
                      {item.featured && <span className="badge">Favorito</span>}
                    </h4>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <div className="cprice">{cop(Number(item.price))}</div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
