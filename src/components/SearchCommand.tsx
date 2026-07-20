"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { navItems } from "@/lib/nav";
import { getSearchCoursesAction } from "@/app/actions/exams";
import { BookIcon } from "@/components/icons";

type Item = {
  label: string;
  href: string;
  group: "Pages" | "Courses";
  hint?: string;
  icon: typeof BookIcon;
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [dynamicCourses, setDynamicCourses] = useState<{ slug: string; title: string; category: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search items on mount
  useEffect(() => {
    getSearchCoursesAction()
      .then((c) => setDynamicCourses(c))
      .catch((err) => console.error("Failed to load courses for search", err));
  }, []);

  const items: Item[] = useMemo(() => {
    return [
      ...navItems.map((n) => ({
        label: n.label,
        href: n.href,
        group: "Pages" as const,
        icon: n.icon,
      })),
      ...dynamicCourses.map((c) => ({
        label: c.title,
        href: `/courses/${c.slug}`,
        group: "Courses" as const,
        hint: c.category,
        icon: BookIcon,
      })),
    ];
  }, [dynamicCourses]);

  // Global ⌘K / Ctrl+K to toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q),
    );
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let flatIndex = -1;

  return (
    <>
      {/* Trigger (styled like a search field) */}
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-full border border-line bg-surface-muted px-4 py-2.5 text-left text-sm text-slate-400 transition-colors hover:border-navy-600/40"
      >
        <SearchIcon />
        <span className="flex-1 truncate">Search courses, pages, exams...</span>
        <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search pages and courses..."
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="scroll-thin max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}
              {(["Pages", "Courses"] as const).map((group) => {
                const groupItems = results.filter((r) => r.group === group);
                if (!groupItems.length) return null;
                return (
                  <div key={group} className="mb-1">
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                      {group}
                    </p>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const isActive = flatIndex === active;
                      const idx = flatIndex;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => go(item.href)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            isActive ? "bg-navy-50 text-navy" : "text-slate-700"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate font-medium">{item.label}</span>
                          {item.hint && <span className="text-xs text-muted">{item.hint}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
