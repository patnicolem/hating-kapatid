"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/components/Toast";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
};

export default function SettingsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user");
        }

        const data = await response.json();

        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function saveProfile() {
    if (!user || isSavingProfile) return;

    if (name.trim() === "" || email.trim() === "") {
      toast("Name and email are required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to update profile");
      }

      setUser((current) =>
        current ? { ...current, ...data } : current
      );

      toast("Profile updated.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function savePassword() {
    if (!user || isSavingPassword) return;

    if (currentPassword === "" || newPassword === "") {
      toast("Current and new password are required.");
      return;
    }

    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters.");
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast(
        "Password must contain at least one letter and one number."
      );
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");

      toast("Password updated.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setIsSavingPassword(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-hk-text-light">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-hk-text">
        Account Settings
      </h1>

      <p className="mt-1 text-sm text-hk-text-light">
        Manage your profile and sign-in details.
      </p>

      <div
        className="
          mt-6
          rounded-xl
          border
          border-hk-border
          bg-hk-surface
          p-6
        "
      >
        <h2 className="text-lg font-semibold text-hk-text">
          Profile
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-hk-text-secondary"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-hk-text-secondary"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={isSavingProfile}
            className="
              flex
              items-center
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
            {isSavingProfile ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {user?.hasPassword && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-hk-border
            bg-hk-surface
            p-6
          "
        >
          <h2 className="text-lg font-semibold text-hk-text">
            Change Password
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-medium text-hk-text-secondary"
              >
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-sm font-medium text-hk-text-secondary"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={savePassword}
              disabled={isSavingPassword}
              className="
                flex
                items-center
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
              {isSavingPassword ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Update Password
            </button>
          </div>
        </div>
      )}

      {user && !user.hasPassword && (
        <p
          className="
            mt-6
            rounded-xl
            border
            border-hk-border
            bg-hk-surface
            px-5
            py-4
            text-sm
            text-hk-text-light
          "
        >
          You sign in with Google, so no password is needed here.
        </p>
      )}
    </div>
  );
}