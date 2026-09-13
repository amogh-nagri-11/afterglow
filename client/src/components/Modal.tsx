import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = { title: string; description?: string; onClose: () => void; children: ReactNode };

export function Modal({ title, description, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-ink-850 p-7 shadow-2xl shadow-black/60 animate-fade-up [animation-duration:.25s]">
        <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 rounded-full p-1.5 text-sand-400 hover:bg-white/5 hover:text-sand-50">
          <X className="size-4" />
        </button>
        <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-sand-400">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
