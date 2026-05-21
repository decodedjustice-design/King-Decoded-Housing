import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-parchment">{children}</main>;
}

export function PageHero({
  eyebrow,
  title,
  text,
  children
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-espresso text-cream">
      <div className="section-shell grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cream/65">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-none">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-cream/76">{text}</p>
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[8px] border border-espresso/10 bg-white/55 p-4">
      <span className="block text-xs uppercase tracking-[0.12em] text-cocoa">{label}</span>
      <strong className="mt-1 block text-2xl text-espresso">{value}</strong>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-burgundy/10 px-3 py-1 text-xs font-semibold text-burgundy">{children}</span>;
}
