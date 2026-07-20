const accents: Record<string, string> = {
  navy: "bg-navy-50 text-navy",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-100 text-brand-green",
  slate: "bg-slate-100 text-slate-600",
};

export function Avatar({
  name,
  accent = "navy",
  size = 44,
}: {
  name: string;
  accent?: keyof typeof accents | string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .filter((w) => !/^(dr\.?|mr\.?|mrs\.?|ms\.?)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${
        accents[accent] ?? accents.navy
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
