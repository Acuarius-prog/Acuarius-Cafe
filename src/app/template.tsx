"use client";
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-anim">
      <div className="page-veil" aria-hidden="true">
        <img src="/logo.jpg" alt="" className="page-veil-logo" />
      </div>
      {children}
    </div>
  );
}
