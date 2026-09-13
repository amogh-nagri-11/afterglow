import { useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { assetUrl, type Photo } from "../lib/api";
import { timeAgo } from "../lib/format";
import { Avatar } from "./Avatar";

type Props = { photos: Photo[]; index: number; onClose: () => void; onNavigate: (index: number) => void };

export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {photo.uploader && <Avatar name={photo.uploader.name} src={photo.uploader.avatarUrl} size={32} className="ring-0" />}
          <div className="min-w-0">
            <p className="truncate text-sm">{photo.uploader?.name ?? "Unknown"}</p>
            <p className="text-xs text-sand-500">
              {timeAgo(photo.uploadedAt)} · {index + 1} of {photos.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={assetUrl(photo.storageUrl)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-sand-200 hover:bg-white/10"
          >
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">Original</span>
          </a>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-sand-200 hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-20" onClick={onClose}>
        <img
          key={photo.id}
          src={assetUrl(photo.storageUrl)}
          alt=""
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl animate-fade-up [animation-duration:.3s]"
          style={photo.thumbnailUrl ? { backgroundImage: `url(${assetUrl(photo.thumbnailUrl)})`, backgroundSize: "cover" } : undefined}
        />

        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index - 1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index + 1);
            }}
            aria-label="Next photo"
            className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
