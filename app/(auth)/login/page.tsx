"use client";

import { useEffect, useState } from "react";
import { HandCoins, Loader2 } from "lucide-react";
import { toast } from "@/components/Toast";
import ThemeToggle from "@/components/ThemeToggle";

type Mode = "login" | "register";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google: "Google sign-in failed. Please try again.",
  invalid_state: "This sign-in request expired. Please try again.",
  email_not_verified: "Your Google email is not verified.",
};

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      toast(
        GOOGLE_ERROR_MESSAGES[error] ??
          "Google sign-in failed. Please try again."
      );
    }
  }, []);

  function getNextPath(): string {
    const next = new URLSearchParams(window.location.search).get("next");

    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }

    return "/";
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    if (email.trim() === "" || password === "") {
      toast("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (name.trim() === "") {
        toast("Name is required.");
        return;
      }

      if (password.length < 8) {
        toast("Password must be at least 8 characters.");
        return;
      }

      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        toast(
          "Password must contain at least one letter and one number."
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Something went wrong");
      }

      window.location.assign(getNextPath());
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Something went wrong"
      );
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
    window.location.assign(
      `/api/auth/google?next=${encodeURIComponent(getNextPath())}`
    );
  }

  const inputClass = `
    w-full
    rounded-lg
    border
    border-hk-border
    bg-hk-surface
    px-3
    py-2.5
    text-hk-text
    placeholder:text-hk-text-muted
    transition-colors
    focus:border-hk-primary
    focus:outline-none
    focus:ring-2
    focus:ring-hk-primary/20
  `;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-hk-border
          bg-hk-surface
          p-8
          shadow-sm
        "
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <HandCoins
            size={36}
            strokeWidth={2}
            className="text-hk-primary"
          />

          <h1 className="mt-3 text-2xl font-bold text-hk-text">
            Hating Kapatid
          </h1>

          <p className="mt-1 text-sm text-hk-text-light">
            {mode === "login"
              ? "Sign in to your account"
              : "Create your account"}
          </p>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            className={inputClass}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-hk-primary
              px-6
              py-2.5
              font-medium
              text-white
              transition-colors
              hover:bg-hk-primary-hover
              disabled:opacity-60
            "
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-hk-border" />
            <span className="text-xs text-hk-text-muted">or</span>
            <div className="h-px flex-1 bg-hk-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-hk-border
              bg-hk-surface
              px-6
              py-2.5
              font-medium
              text-hk-text
              transition-colors
              hover:bg-hk-surface-secondary
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="pt-2 text-center text-sm text-hk-text-light">
            {mode === "login" ? (
              <>
                No account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setName("");
                  }}
                  className="font-medium text-hk-primary hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-medium text-hk-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}