export function Logo() {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <span className="text-xl font-extrabold tracking-tight text-navy">TEK</span>
      <span
        aria-hidden
        className="grid h-6 w-6 place-items-center rounded-full bg-orange"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#fff">
          <path d="M12 2c1 3-1 4-1 6 0 1 1 2 2 2 1 0 2-1 2-2 2 2 3 4 3 7a6 6 0 1 1-12 0c0-3 2-5 3-6 1-1 1-3 0-5 2 0 3 1 3 3 1-2 0-4-3-5z" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-orange">SKILL</span>
      <span className="text-xl font-extrabold tracking-tight text-navy">UP</span>
    </div>
  );
}
