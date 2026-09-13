import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Check, CircleAlert, Copy, Link2, LoaderCircle, Lock, Sparkles, Trash2 } from "lucide-react";
import { AvatarStack } from "../components/Avatar";
import { Lightbox } from "../components/Lightbox";
import { Modal } from "../components/Modal";
import { Scene } from "../components/Scene";
import { Uploader } from "../components/Uploader";
import { api, ApiError, assetUrl, errorMessage, type Photo, type PoolDetail } from "../lib/api";
import { useAuth } from "../lib/auth";
import { dayLabel, formatDate, timeAgo } from "../lib/format";

export default function PoolPage() {
  const { poolId } = useParams();
  const id = Number(poolId);
  const { user } = useAuth();
  const location = useLocation();
  const justCreated = Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);

  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setError(new ApiError("Pool not found", 404, null));
      return;
    }

    let cancelled = false;
    setPool(null);
    setError(null);

    Promise.all([api.pools.get(id), api.photos.list(id)])
      .then(([poolRes, photoRes]) => {
        if (cancelled) return;
        setPool(poolRes.pool);
        setRole(poolRes.role);
        setPhotos(photoRes.photos);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err : new ApiError(errorMessage(err), 0, null));
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleUploaded = useCallback(
    (photo: Photo) => {
      const uploader = user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : undefined;
      setPhotos((prev) => [{ ...photo, uploader }, ...prev]);
    },
    [user],
  );

  const groups = useMemo(() => {
    const out: { label: string; items: { photo: Photo; index: number }[] }[] = [];
    photos.forEach((photo, index) => {
      const label = dayLabel(photo.uploadedAt);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push({ photo, index });
      else out.push({ label, items: [{ photo, index }] });
    });
    return out;
  }, [photos]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  // Mirrors the server rule: uploader or pool owner
  const canDelete = useCallback((photo: Photo) => photo.uploaderId === user?.id || role === "owner", [user, role]);

  const closeDelete = useCallback(() => {
    setPendingDelete(null);
    setDeleteError(null);
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.photos.remove(pendingDelete.poolId, pendingDelete.id);
      const remaining = photos.length - 1;
      setPhotos((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      setLightboxIndex((i) => (i === null || remaining === 0 ? null : Math.min(i, remaining - 1)));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    const forbidden = error.status === 403 || error.status === 404;
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-28 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-white/5">
          {forbidden ? <Lock className="size-6 text-sand-200" /> : <CircleAlert className="size-6 text-rose-300" />}
        </span>
        <h1 className="mt-6 font-serif text-4xl tracking-tight">{forbidden ? "This pool is private" : "Couldn't load this pool"}</h1>
        <p className="mt-3 text-sand-400">
          {forbidden ? "You're not a member of this pool. Ask whoever started it for their invite link." : error.message}
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/pools" className="btn btn-ghost">Back to your pools</Link>
          {!forbidden && <button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>}
        </div>
      </div>
    );
  }

  if (!pool) return <PoolSkeleton />;

  const photoCount = photos.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/pools" className="inline-flex items-center gap-1.5 text-sm text-sand-400 hover:text-sand-50">
        <ArrowLeft className="size-4" /> All pools
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <h1 className="font-serif text-5xl tracking-tight break-words sm:text-6xl">{pool.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-sand-400">
            <div className="flex items-center gap-2.5">
              <AvatarStack users={pool.members.map((m) => m.user)} />
              <span>
                {pool.members.length} {pool.members.length === 1 ? "member" : "members"}
              </span>
            </div>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <span>
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <span>Started {formatDate(pool.createdAt)}</span>
          </div>
        </div>
        <InviteCard code={pool.inviteCode} highlight={justCreated} />
      </div>

      {justCreated && photoCount === 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/[.06] px-4 py-3 text-sm text-amber-100/90">
          <Sparkles className="mt-0.5 size-4 shrink-0" />
          Your pool is ready. Add a few photos to get it started, then share the invite link so everyone else can add theirs.
        </div>
      )}

      <div className="mt-8">
        <Uploader poolId={pool.id} onUploaded={handleUploaded} />
      </div>

      <section className="mt-12">
        {photoCount === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 py-24 text-center">
            <Scene name="dusk" className="opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-ink-950/40" />
            <div className="relative">
              <h2 className="font-serif text-4xl tracking-tight">No photos yet</h2>
              <p className="mt-2 text-sand-400">Be the first to add some. They'll show up here for everyone.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-sm font-medium text-sand-200">{group.label}</h2>
                  <span className="text-xs text-sand-500">{group.items.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {group.items.map(({ photo, index }) => (
                    <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-800">
                    <button
                      onClick={() => setLightboxIndex(index)}
                      className="block h-full w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-300"
                    >
                      <img
                        src={assetUrl(photo.thumbnailUrl ?? photo.storageUrl)}
                        alt={`Photo by ${photo.uploader?.name ?? "a member"}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2.5 text-left text-xs opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="truncate">{photo.uploader?.name}</span>
                        <span className="shrink-0 text-white/60">{timeAgo(photo.uploadedAt)}</span>
                      </div>
                    </button>
                    {canDelete(photo) && (
                      <button
                        onClick={() => setPendingDelete(photo)}
                        aria-label="Delete photo"
                        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-rose-500 focus-visible:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
          canDelete={canDelete}
          onDelete={setPendingDelete}
          paused={pendingDelete !== null}
        />
      )}

      {pendingDelete && (
        <Modal
          title="Delete this photo?"
          description={
            pendingDelete.uploaderId === user?.id
              ? "It will be removed from the pool for everyone. This can't be undone."
              : `This was added by ${pendingDelete.uploader?.name ?? "another member"}. It will be removed for everyone. This can't be undone.`
          }
          onClose={closeDelete}
        >
          {pendingDelete.thumbnailUrl && (
            <img src={assetUrl(pendingDelete.thumbnailUrl)} alt="" className="h-40 w-full rounded-2xl object-cover" />
          )}
          {deleteError && <p className="mt-4 text-sm text-rose-300">{deleteError}</p>}
          <div className="mt-6 flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={closeDelete} disabled={deleting}>
              Cancel
            </button>
            <button className="btn flex-1 bg-rose-500 text-white hover:bg-rose-400" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <><Trash2 className="size-4" /> Delete</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InviteCard({ code, highlight }: { code: string; highlight: boolean }) {
  const link = `${window.location.origin}/join/${code}`;
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(what: "code" | "link") {
    try {
      await navigator.clipboard.writeText(what === "code" ? code : link);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked; the code is visible to copy manually */
    }
  }

  return (
    <div
      className={`rounded-3xl border p-5 transition ${
        highlight ? "border-rose-300/30 bg-rose-300/[.05] shadow-[0_0_60px_-20px_rgba(255,125,125,.5)]" : "border-white/10 bg-ink-900"
      }`}
    >
      <p className="text-xs tracking-widest text-sand-500 uppercase">Invite code</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <code className="font-mono text-xl tracking-[0.2em] text-sand-50">{code}</code>
        <button onClick={() => copy("code")} aria-label="Copy invite code" className="rounded-full p-2 text-sand-400 transition hover:bg-white/5 hover:text-sand-50">
          {copied === "code" ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </button>
      </div>
      <button onClick={() => copy("link")} className="btn btn-ghost mt-4 w-full">
        {copied === "link" ? <><Check className="size-4 text-emerald-400" /> Link copied</> : <><Link2 className="size-4" /> Copy invite link</>}
      </button>
    </div>
  );
}

function PoolSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-10">
      <div className="h-4 w-20 rounded bg-white/5" />
      <div className="mt-8 h-14 w-2/3 max-w-md rounded-xl bg-white/5" />
      <div className="mt-5 h-5 w-72 rounded bg-white/5" />
      <div className="mt-10 h-40 rounded-3xl bg-white/[.03]" />
      <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-white/[.03]" />
        ))}
      </div>
    </div>
  );
}
