"use client";

import { useState } from "react";
import { categories } from "@/lib/nav";

export function CategoryPills() {
  const [active, setActive] = useState("Three Digit Reasoning");

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-surface text-navy shadow-sm ring-1 ring-line"
                : "bg-navy text-white hover:bg-navy-700"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
