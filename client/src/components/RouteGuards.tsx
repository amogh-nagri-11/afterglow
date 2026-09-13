import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../lib/auth";

export function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <LoaderCircle className="size-6 animate-spin text-sand-500" />
    </div>
  );
}

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function GuestOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/pools";

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={from} replace />;
  return <Outlet />;
}
