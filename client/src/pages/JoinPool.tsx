import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { api, ApiError, errorMessage } from "../lib/api";

export default function JoinPool() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    api.pools
      .join(code.toLowerCase())
      .then(({ pool }) => navigate(`/pools/${pool.id}`, { replace: true }))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 409 && err.data?.pool) {
          navigate(`/pools/${err.data.pool.id}`, { replace: true });
        } else {
          setError(err instanceof ApiError && err.status === 404 ? "This invite link is invalid or has expired." : errorMessage(err));
        }
      });
  }, [code, navigate]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      {error ? (
        <>
          <span className="grid size-14 place-items-center rounded-full bg-white/5">
            <CircleAlert className="size-6 text-rose-300" />
          </span>
          <h1 className="mt-6 font-serif text-4xl tracking-tight">Couldn't join</h1>
          <p className="mt-3 text-sand-400">{error}</p>
          <Link to="/pools" className="btn btn-ghost mt-8">Go to your pools</Link>
        </>
      ) : (
        <>
          <LoaderCircle className="size-6 animate-spin text-sand-400" />
          <p className="mt-4 text-sand-400">Joining pool…</p>
        </>
      )}
    </div>
  );
}
