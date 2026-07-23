"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MenuIcon, CloseIcon } from "@/components/icons";

export function LandingHeader({
  headerLogo,
  siteName,
}: {
  headerLogo?: string | null;
  siteName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-[#1A3D4B] border-b border-teal-900/60 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo src={headerLogo} siteName={siteName} variant="onDark" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/90 md:flex">
          <a href="#about" className="transition-colors hover:text-white">
            About Us
          </a>
          <a href="#courses" className="flex items-center gap-1 transition-colors hover:text-white">
            Programs
            <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a href="#contact" className="transition-colors hover:text-white">
            Contact Us
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg bg-[#FF4712] px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#e03d0d] active:scale-[0.98]"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors hover:text-white/80"
          >
            Register
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button (3 lines) */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10 md:hidden transition-colors"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-[#1A3D4B] text-white p-6 shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-teal-800/60">
          <Logo src={headerLogo} siteName={siteName} variant="onDark" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex-1 space-y-4 py-6 text-base font-semibold">
          <a
            href="#about"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            About Us
          </a>
          <a
            href="#courses"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            Programs
          </a>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            Contact Us
          </a>
          <a
            href="#faq"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            FAQ
          </a>
        </div>

        {/* Mobile Action Buttons */}
        <div className="space-y-3 border-t border-teal-800/60 pt-6">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block w-full rounded-xl bg-[#FF4712] py-3 text-center text-sm font-bold text-white shadow-md hover:bg-[#e03d0d] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="block w-full rounded-xl border border-white/30 py-3 text-center text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            Register
          </Link>
        </div>
      </aside>
    </header>
  );
}
