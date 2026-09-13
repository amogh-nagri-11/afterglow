import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert, KeyRound, LoaderCircle, Plus } from "lucide-react";
import { Modal } from "../components/Modal";
import { SCENES, Scene } from "../components/Scene";
import { api, ApiError, assetUrl, errorMessage, type PoolSummary } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, greeting } from "../lib/format";

export default function Pools() {
  const { user } = useAuth();
  const [pools, setPools] = useState<PoolSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "join" | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.pools
      .list()
      .then(({ pools }) => setPools(pools))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  useEffect(load, [load]);

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-sand-500">
            {greeting()}, {user?.name.split(" ")[0]}
          </p>
          <h1 className="mt-1 font-serif text-5xl tracking-tight">Your pools</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost" onClick={() => setModal("join")}>
            <KeyRound className="size-4" /> Join with code
          </button>
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            <Plus className="size-4" /> New pool
          </button>
        </div>
      </div>

      <div className="mt-10">
        {error ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[.02] py-16 text-center">
            <CircleAlert className="size-6 text-rose-300" />
            <p className="text-sand-200">{error}</p>
            <button className="btn btn-ghost" onClick={load}>Try again</button>
          </div>
        ) : pools === null ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/[.03]" />
            ))}
          </div>
        ) : pools.length === 0 ? (
          <EmptyState onCreate={() => setModal("create")} onJoin={() => setModal("join")} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
            <button
              onClick={() => setModal("create")}
              className="group flex min-h-80 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 text-sand-400 transition hover:border-white/25 hover:text-sand-50"
            >
              <span className="grid size-12 place-items-center rounded-full bg-white/5 transition group-hover:bg-white/10">
                <Plus className="size-5" />
              </span>
              Start another pool
            </button>
          </div>
        )}
      </div>

      {modal === "create" && <CreatePoolModal onClose={closeModal} />}
      {modal === "join" && <JoinPoolModal onClose={closeModal} />}
    </div>
  );
}

function PoolCard({ pool }: { pool: PoolSummary }) {
  const thumbs = pool.photos.filter((p) => p.thumbnailUrl);

  return (
    <Link
      to={`/pools/${pool.id}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-ink-900 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-800">
        {thumbs.length === 0 ? (
          <>
            <Scene name={SCENES[pool.id % SCENES.length]} className="opacity-60 transition duration-500 group-hover:scale-105" />
            <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs text-sand-200 backdrop-blur">
              No photos yet
            </span>
          </>
        ) : thumbs.length < 4 ? (
          <img src={assetUrl(thumbs[0].thumbnailUrl!)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5 transition duration-500 group-hover:scale-105">
            {thumbs.slice(0, 4).map((t) => (
              <img key={t.id} src={assetUrl(t.thumbnailUrl!)} alt="" className="h-full w-full object-cover" />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-medium">{pool.name}</h3>
          <p className="mt-1 text-sm text-sand-500">
            {pool._count.photos} {pool._count.photos === 1 ? "photo" : "photos"} · {pool._count.members}{" "}
            {pool._count.members === 1 ? "member" : "members"}
          </p>
        </div>
        <span className="shrink-0 text-xs text-sand-500">{formatDate(pool.createdAt)}</span>
      </div>
    </Link>
  );
}

function EmptyState({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900 px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-[36rem] max-w-full rounded-full bg-[radial-gradient(closest-side,rgba(255,125,125,.22),transparent)]" />
      <div className="relative mx-auto mb-8 flex h-40 w-72 justify-center">
        <div className="absolute left-4 top-4 h-32 w-24 -rotate-12 overflow-hidden rounded-xl border border-white/10 shadow-xl"><Scene name="coast" /></div>
        <div className="absolute z-10 h-36 w-28 overflow-hidden rounded-xl border border-white/10 shadow-2xl"><Scene name="dusk" /></div>
        <div className="absolute right-4 top-4 h-32 w-24 rotate-12 overflow-hidden rounded-xl border border-white/10 shadow-xl"><Scene name="city" /></div>
      </div>
      <h2 className="relative font-serif text-4xl tracking-tight">Nothing here yet</h2>
      <p className="relative mx-auto mt-3 max-w-md text-sand-400">
        Create a pool for your next trip or event, or join one a friend already started with their invite code.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn btn-primary" onClick={onCreate}>
          <Plus className="size-4" /> Create a pool
        </button>
        <button className="btn btn-ghost" onClick={onJoin}>
          <KeyRound className="size-4" /> I have a code
        </button>
      </div>
    </div>
  );
}

const suggestions = ["Lisbon trip", "Sam's 30th", "Team offsite", "Our wedding"];

function CreatePoolModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { pool } = await api.pools.create(name.trim());
      navigate(`/pools/${pool.id}`, { state: { justCreated: true } });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New pool" description="Give it a name everyone will recognise." onClose={onClose}>
      <form onSubmit={onSubmit}>
        <input autoFocus required maxLength={80} className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tahoe weekend" />
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setName(s)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-sand-400 transition hover:border-white/25 hover:text-sand-50"
            >
              {s}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={submitting || !name.trim()} className="btn btn-primary mt-6 w-full">
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <>Create pool <ArrowRight className="size-4" /></>}
        </button>
      </form>
    </Modal>
  );
}

function JoinPoolModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Accept a pasted invite link as well as a bare code
    const inviteCode = code.trim().split("/").pop()!.toLowerCase();

    try {
      const { pool } = await api.pools.join(inviteCode);
      navigate(`/pools/${pool.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.data?.pool) {
        return navigate(`/pools/${err.data.pool.id}`);
      }
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Join a pool" description="Paste the invite code or link someone shared with you." onClose={onClose}>
      <form onSubmit={onSubmit}>
        <input autoFocus required className="field font-mono tracking-wider" value={code} onChange={(e) => setCode(e.target.value)} placeholder="7f3a9c21e4b0" />
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={submitting || !code.trim()} className="btn btn-primary mt-6 w-full">
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <>Join pool <ArrowRight className="size-4" /></>}
        </button>
      </form>
    </Modal>
  );
}
