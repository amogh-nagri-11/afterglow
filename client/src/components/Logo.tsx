export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative size-7 overflow-hidden rounded-full bg-glow shadow-[0_0_24px_-4px_rgba(255,125,125,.7)]">
        <span className="absolute inset-x-0 bottom-0 h-[40%] bg-ink-950/85" />
      </span>
      <span className="font-serif text-[1.65rem] leading-none tracking-tight">afterglow</span>
    </span>
  );
}
