"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BuildingIcon,
  CreditCardIcon,
  MailIcon,
  ClipboardIcon,
  ImageIcon,
} from "@/components/icons";

const tabs = [
  { label: "General", href: "/admin/settings/general", icon: BuildingIcon },
  { label: "Payment", href: "/admin/settings/payment", icon: CreditCardIcon },
  { label: "SMTP", href: "/admin/settings/smtp", icon: MailIcon },
  { label: "Email Templates", href: "/admin/settings/email-templates", icon: ClipboardIcon },
  { label: "Branding", href: "/admin/settings/branding", icon: ImageIcon },
];

export function SettingsSubNav() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-slate-200/80 gap-1 overflow-x-auto scrollbar-none pb-px">
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all whitespace-nowrap ${
              active
                ? "border-orange text-orange"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
