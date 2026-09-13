import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Link to="/"><Logo /></Link>
      <p className="mt-16 font-serif text-[9rem] leading-none text-glow">404</p>
      <h1 className="mt-4 text-xl">This page faded out.</h1>
      <p className="mt-2 text-sand-400">The link may be broken, or the page may have moved.</p>
      <Link to="/" className="btn btn-ghost mt-8">Take me home</Link>
    </div>
  );
}
