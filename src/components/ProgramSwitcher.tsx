"use client";

import { useState } from "react";
import { Menu } from "@/components/Menu";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";

const programs = [
  { code: "ACTFR", name: "Aptitude, Career & Fast-track" },
  { code: "NUMPRO", name: "Numerical Pro" },
  { code: "INTVW", name: "Interview Track" },
];

export function ProgramSwitcher() {
  const [current, setCurrent] = useState(programs[0].code);

  return (
    <Menu
      align="left"
      panelClassName="w-60 rounded-xl border border-line bg-surface p-1.5 shadow-lg"
      button={() => (
        <span className="inline-flex items-center gap-1 font-semibold text-orange">
          {current}
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </span>
      )}
    >
      {(close) => (
        <>
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Switch program
          </p>
          {programs.map((p) => (
            <button
              key={p.code}
              onClick={() => {
                setCurrent(p.code);
                close();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-navy-50"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-xs font-bold text-navy">
                {p.code.slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">{p.code}</span>
                <span className="block truncate text-xs text-muted">{p.name}</span>
              </span>
              {current === p.code && <CheckIcon className="h-4 w-4 shrink-0 text-navy" />}
            </button>
          ))}
        </>
      )}
    </Menu>
  );
}
