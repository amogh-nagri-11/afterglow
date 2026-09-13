import { GoogleLogin } from "@react-oauth/google";
import { errorMessage } from "../lib/api";
import { useAuth } from "../lib/auth";

export const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

type Props = { onSuccess: () => void; onError: (message: string) => void; mode?: "signin" | "signup" };

export function GoogleButton({ onSuccess, onError, mode = "signin" }: Props) {
  const { loginWithGoogle } = useAuth();

  if (!googleEnabled) return null;

  return (
    <div className="flex h-11 justify-center">
      <GoogleLogin
        theme="filled_black"
        shape="pill"
        size="large"
        width="320"
        text={mode === "signup" ? "signup_with" : "continue_with"}
        onSuccess={async ({ credential }) => {
          if (!credential) return onError("Google didn't return a credential. Please try again.");
          try {
            await loginWithGoogle(credential);
            onSuccess();
          } catch (err) {
            onError(errorMessage(err));
          }
        }}
        onError={() => onError("Google sign-in failed. Please try again.")}
      />
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-xs tracking-widest text-sand-500 uppercase">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
