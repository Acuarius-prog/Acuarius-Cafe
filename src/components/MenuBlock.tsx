import { getSupabase } from "@/lib/supabase/server";
import MenuSection from "@/components/MenuSection";

export default async function MenuBlock({ table }: { table?: number | null }) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = getSupabase();

  if (!supabase || !url || !key) {
    return (
      <p className="carta-note">
        Conecta Supabase (<code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code>) para mostrar la carta.
      </p>
    );
  }

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("id,name,slug,sort_order").eq("active", true).order("sort_order"),
    supabase.from("menu_items").select("id,name,description,price,featured,category_id,image_url").eq("active", true).order("name"),
  ]);

  if (!categories || !items || items.length === 0) {
    return <p className="carta-note">Aún no hay productos cargados. Agrégalos desde tu panel <code>/admin</code>.</p>;
  }

  return <MenuSection categories={categories} items={items} supabaseUrl={url} supabaseKey={key} table={table ?? null} />;
}
