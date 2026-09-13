import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Scene } from "./Scene";

type Props = { title: string; subtitle: string; children: ReactNode; footer: ReactNode };

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="self-start">
          <Logo />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 animate-fade-up">
          <h1 className="font-serif text-5xl tracking-tight">{title}</h1>
          <p className="mt-3 text-sand-400">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <p className="mt-8 text-center text-sm text-sand-400">{footer}</p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-white/5 bg-ink-900 lg:block">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-3 opacity-90">
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl"><Scene name="dusk" /></div>
          <div className="relative overflow-hidden rounded-3xl"><Scene name="city" /></div>
          <div className="relative overflow-hidden rounded-3xl"><Scene name="party" /></div>
          <div className="relative overflow-hidden rounded-3xl"><Scene name="coast" /></div>
          <div className="relative overflow-hidden rounded-3xl"><Scene name="bonfire" /></div>
          <div className="relative overflow-hidden rounded-3xl"><Scene name="peaks" /></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
        <blockquote className="absolute inset-x-12 bottom-12">
          <p className="font-serif text-4xl leading-tight">
            “Eighty-six guests, one link, and not a single <em className="text-glow">‘can you send me that one?’</em>”
          </p>
          <footer className="mt-4 text-sm text-sand-400">Priya &amp; Arjun · wedding pool, 1,240 photos</footer>
        </blockquote>
      </aside>
    </div>
  );
}
