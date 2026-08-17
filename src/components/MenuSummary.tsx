import { getSupabase } from "@/lib/supabase/server";

type Cat = { id: string; name: string; slug: string };

const imgFor = (c: Cat) => {
  const k = ((c.slug || "") + " " + (c.name || "")).toLowerCase();
  if (k.includes("cerveza")) return "/cat-cerveza.jpg";
  if (k.includes("coctel") || k.includes("cóctel") || k.includes("cocteler") || k.includes("trago")) return "/cat-cocteles.jpg";
  if (k.includes("cafe") || k.includes("café")) return "/cat-cafes.jpg";
  if (k.includes("jugo") || k.includes("smoothie") || k.includes("batido")) return "/cat-jugos.jpg";
  if (k.includes("postre")) return "/cat-postres.jpg";
  if (k.includes("infus") || k.includes("té") || k.includes("tes") || k.startsWith("te")) return "/cat-tes.jpg";
  return "/cat-cafes.jpg";
};

export default async function MenuSummary() {
  const supabase = getSupabase();
  let categories: Cat[] = [];
  if (supabase) {
    const { data } = await supabase.from("menu_categories").select("id,name,slug").eq("active", true).order("sort_order");
    categories = (data as Cat[]) ?? [];
  }
  if (categories.length === 0) {
    categories = [
      { id: "1", name: "Cafés", slug: "cafe" }, { id: "2", name: "Tés e infusiones", slug: "te" },
      { id: "3", name: "Jugos y smoothies", slug: "jugo" }, { id: "4", name: "Postres", slug: "postre" },
      { id: "5", name: "Cócteles", slug: "coctel" }, { id: "6", name: "Cerveza", slug: "cerveza" },
    ];
  }
  return (
    <div className="menu-summary">
      <div className="ms-grid">
        {categories.map((c) => (
          <a key={c.id} href="/menu" className="ms-card" style={{ backgroundImage: `url(${imgFor(c)})` }}>
            <span className="ms-ov"></span>
            <span className="ms-name">{c.name}</span>
          </a>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: "26px" }}>
        <a href="/menu" className="btn btn-primary">Ver la carta completa →</a>
      </div>
    </div>
  );
}
