"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  HandCoins,
  Loader2,
  UsersRound,
  UserPlus,
  LogIn,
  CheckCircle2,
  Home,
} from "lucide-react";
import { toast } from "@/components/Toast";

type InviteInfo = {
  group: { id: string; name: string };
  inviter: { id: string; name: string };
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [inviteResponse, meResponse, groupsResponse] = await Promise.all([
          fetch(`/api/invite/${token}`),
          fetch("/api/auth/me"),
          fetch("/api/groups"),
        ]);

        if (inviteResponse.status === 404) {
          setNotFound(true);
          return;
        }

        if (!inviteResponse.ok) {
          throw new Error("Failed to load invite");
        }

        const inviteData: InviteInfo = await inviteResponse.json();
        setInvite(inviteData);

        if (meResponse.ok) {
          const me = await meResponse.json();
          setUser(me);

          if (groupsResponse.ok) {
            const groups: { id: string }[] = await groupsResponse.json();
            setAlreadyMember(
              groups.some((group) => group.id === inviteData.group.id)
            );
          }
        }
      } catch (error) {
        console.error("Failed to load invite:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token]);

  const nextUrl = `/invite/${token}`;

  async function join() {
    setIsJoining(true);

    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: "POST",
      });

      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(nextUrl)}`);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to join group");
      }

      toast(`You joined ${invite?.group.name}.`, "success");
      window.location.assign("/groups");
    } catch (error) {
      console.error("Error joining group:", error);
      toast(error instanceof Error ? error.message : "Failed to join group");
      setIsJoining(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={28} className="animate-spin text-hk-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
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
            ambagan made easy
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-hk-border
            bg-hk-surface
            p-8
            text-center
            shadow-sm
          "
        >
          {notFound ? (
            <>
              <p className="text-lg font-semibold text-hk-text">
                Invite link not found
              </p>

              <p className="mt-2 text-sm text-hk-text-light">
                This invite link is invalid or has expired.
              </p>

              <Link
                href="/"
                className="
                  mt-6
                  inline-flex
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
                "
              >
                <Home size={16} />
                Go to Home
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-hk-primary">
                <UsersRound size={22} />
                <span className="text-lg font-semibold">
                  {invite?.group.name}
                </span>
              </div>

              <p className="mt-3 text-sm text-hk-text-light">
                {invite?.inviter.name} invited you to join their expense
                group.
              </p>

              {!user ? (
                <div className="mt-6 space-y-3">
                  <Link
                    href={`/login?next=${encodeURIComponent(nextUrl)}`}
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
                    "
                  >
                    <LogIn size={16} />
                    Sign in or create an account
                  </Link>

                  <p className="text-xs text-hk-text-muted">
                    You&apos;ll need an account to join this group.
                  </p>
                </div>
              ) : alreadyMember ? (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-hk-success">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">
                      You&apos;re already a member
                    </span>
                  </div>

                  <Link
                    href="/groups"
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
                    "
                  >
                    Open Group
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={join}
                  disabled={isJoining}
                  className="
                    mt-6
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
                  {isJoining ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  Join Group
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}