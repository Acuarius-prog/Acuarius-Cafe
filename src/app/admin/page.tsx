import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Acuarius · Panel Admin" };

export default function AdminPage() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <h1 className="admin-h">Falta configurar Supabase</h1>
          <p className="admin-muted">
            Agrega <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> en las
            variables de tu proyecto en Cloudflare.
          </p>
        </div>
      </div>
    );
  }

  return <AdminClient supabaseUrl={url} supabaseKey={key} />;
}
