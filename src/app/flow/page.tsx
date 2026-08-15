import FlowAccount from "@/components/FlowAccount";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Acuarius · Mi Flow" };

export default function FlowPage() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return <div className="flow-wrap"><p className="muted">Conecta Supabase para usar el programa Flow.</p></div>;
  }
  return (
    <>
      <Nav />
      <div className="flow-page">
        <FlowAccount supabaseUrl={url} supabaseKey={key} />
      </div>
    </>
  );
}
