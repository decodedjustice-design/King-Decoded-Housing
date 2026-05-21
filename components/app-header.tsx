import Link from "next/link";
import { ArrowRight } from "lucide-react";

const links = [
  ["Housing", "/housing"],
  ["Map", "/map"],
  ["Triage", "/triage"],
  ["Resources", "/resources"],
  ["Barriers", "/barriers"]
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-espresso/10 bg-parchment/92 backdrop-blur">
      <div className="section-shell flex h-16 items-center justify-between">
        <Link className="font-serif text-2xl text-espresso" href="/">
          Decoded Housing
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-cocoa md:flex">
          {links.map(([label, href]) => (
            <Link className="transition hover:text-burgundy" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-sm font-medium text-cream" href="/triage">
          Start plan
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}
