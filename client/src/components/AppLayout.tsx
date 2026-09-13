import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, Images, LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/pools">
            <Logo />
          </Link>
          <UserMenu />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-1 text-sm transition hover:bg-white/10"
      >
        <Avatar name={user.name} src={user.avatarUrl} size={28} className="ring-0" />
        <span className="hidden max-w-32 truncate sm:inline">{user.name.split(" ")[0]}</span>
        <ChevronDown className={`size-4 text-sand-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-2xl shadow-black/50 animate-fade-up [animation-duration:.2s]">
          <div className="border-b border-white/5 px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-sand-500">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link to="/pools" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sand-200 hover:bg-white/5">
              <Images className="size-4" /> Your pools
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sand-200 hover:bg-white/5"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
