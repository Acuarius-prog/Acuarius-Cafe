import { getSupabase } from "@/lib/supabase/server";

type Cat = { id: string; name: string; slug: string };

const ICONS: Record<string, string> = {
  cafe: "☕", cafes: "☕", te: "🍵", tes: "🍵", jugo: "🥤", jugos: "🥤",
  smoothie: "🥤", postre: "🍰", postres: "🍰", coctel: "🍸", cocteles: "🍸",
  cerveza: "🍺", cervezas: "🍺",
};
const iconFor = (s: string) => {
  const k = (s || "").toLowerCase();
  for (const key of Object.keys(ICONS)) if (k.includes(key)) return ICONS[key];
  return "✨";
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
          <a key={c.id} href="/menu" className="ms-card">
            <span className="ms-icon">{iconFor(c.slug || c.name)}</span>
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
