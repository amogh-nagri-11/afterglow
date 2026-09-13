type AvatarProps = { name: string; src?: string | null; size?: number; className?: string };

export function Avatar({ name, src, size = 32, className = "" }: AvatarProps) {
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        style={style}
        className={`shrink-0 rounded-full object-cover ring-2 ring-ink-950 ${className}`}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  let hue = 0;
  for (const ch of name) hue = (hue * 31 + ch.charCodeAt(0)) % 360;

  return (
    <span
      title={name}
      style={{ ...style, background: `linear-gradient(135deg, hsl(${hue} 85% 72%), hsl(${(hue + 50) % 360} 75% 58%))` }}
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-ink-950 ring-2 ring-ink-950 ${className}`}
    >
      {initials || "?"}
    </span>
  );
}

export function AvatarStack({ users, max = 5, size = 28 }: { users: { id: number; name: string; avatarUrl: string | null }[]; max?: number; size?: number }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar key={u.id} name={u.name} src={u.avatarUrl} size={size} />
      ))}
      {extra > 0 && (
        <span
          style={{ width: size, height: size }}
          className="inline-grid place-items-center rounded-full bg-ink-700 text-[11px] font-medium text-sand-200 ring-2 ring-ink-950"
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
