import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";

export function Sidebar({ logoUrl, siteName }: { logoUrl?: string | null; siteName?: string | null }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="px-6 py-5">
        <Logo src={logoUrl} siteName={siteName} />
      </div>
      <NavLinks />
    </aside>
  );
}
