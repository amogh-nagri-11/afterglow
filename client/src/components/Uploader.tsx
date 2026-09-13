import { useEffect, useRef, useState, type DragEvent } from "react";
import { CircleAlert, CircleCheck, CloudUpload, LoaderCircle } from "lucide-react";
import { api, errorMessage, MAX_UPLOAD_BYTES, type Photo } from "../lib/api";
import { formatBytes } from "../lib/format";

const CONCURRENCY = 3;

type UploadItem = {
  key: number;
  file: File;
  preview: string;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

export function Uploader({ poolId, onUploaded }: { poolId: number; onUploaded: (photo: Photo) => void }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextKey = useRef(0);
  const started = useRef(new Set<number>());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const update = (key: number, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  // Pump the queue whenever items change
  useEffect(() => {
    const active = items.filter((it) => it.status === "uploading").length;
    const next = items
      .filter((it) => it.status === "queued" && !started.current.has(it.key))
      .slice(0, Math.max(0, CONCURRENCY - active));

    for (const item of next) {
      started.current.add(item.key);
      update(item.key, { status: "uploading" });
      api.photos
        .upload(poolId, item.file, (progress) => update(item.key, { progress }))
        .then((photo) => {
          update(item.key, { status: "done", progress: 100 });
          onUploaded(photo);
        })
        .catch((err) => update(item.key, { status: "error", error: errorMessage(err) }));
    }
  }, [items, poolId, onUploaded]);

  useEffect(() => () => itemsRef.current.forEach((it) => URL.revokeObjectURL(it.preview)), []);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => {
        const tooBig = file.size > MAX_UPLOAD_BYTES;
        return {
          key: nextKey.current++,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: tooBig ? "error" : "queued",
          error: tooBig ? "Larger than 15 MB" : undefined,
        };
      });
    setItems((prev) => [...added, ...prev]);
  }

  function clearFinished() {
    setItems((prev) =>
      prev.filter((it) => {
        const finished = it.status === "done" || it.status === "error";
        if (finished) URL.revokeObjectURL(it.preview);
        return !finished;
      }),
    );
  }

  const onDrag = (e: DragEvent, over: boolean) => {
    e.preventDefault();
    if (over) setDragging(true);
    else if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const pending = items.some((it) => it.status === "queued" || it.status === "uploading");
  const overall = items.length ? Math.round(items.reduce((sum, it) => sum + (it.status === "error" ? 100 : it.progress), 0) / items.length) : 0;

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => onDrag(e, true)}
        onDragOver={(e) => onDrag(e, true)}
        onDragLeave={(e) => onDrag(e, false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`relative flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-10 text-center transition ${
          dragging ? "border-rose-300/70 bg-rose-300/[.06]" : "border-white/12 bg-white/[.02] hover:border-white/25"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className={`grid size-12 place-items-center rounded-full transition ${dragging ? "bg-glow text-ink-950" : "bg-white/5 text-sand-200"}`}>
          <CloudUpload className="size-5" />
        </span>
        <p className="text-sand-200">
          Drop photos here or{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="text-glow font-medium underline-offset-4 hover:underline">
            browse your device
          </button>
        </p>
        <p className="text-xs text-sand-500">JPG, PNG or WebP · up to 15 MB each · originals are kept at full resolution</p>
      </div>

      {items.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-ink-900 p-4">
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-sm">
              {pending ? `Uploading ${doneCount} of ${items.length}` : `Uploaded ${doneCount} of ${items.length}`}
            </p>
            {!pending && (
              <button onClick={clearFinished} className="text-xs text-sand-400 hover:text-sand-50">
                Clear
              </button>
            )}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-glow transition-[width] duration-300" style={{ width: `${overall}%` }} />
          </div>

          <ul className="mt-4 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <li key={it.key} className="flex items-center gap-3 rounded-xl bg-white/[.03] p-2">
                <img src={it.preview} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-sand-200">{it.file.name}</p>
                  {it.status === "error" ? (
                    <p className="truncate text-[11px] text-rose-300">{it.error}</p>
                  ) : (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-sand-200 transition-[width]" style={{ width: `${it.progress}%` }} />
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-sand-500">
                  {it.status === "done" ? (
                    <CircleCheck className="size-4 text-emerald-400" />
                  ) : it.status === "error" ? (
                    <CircleAlert className="size-4 text-rose-300" />
                  ) : it.status === "uploading" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <span className="text-[11px]">{formatBytes(it.file.size)}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
