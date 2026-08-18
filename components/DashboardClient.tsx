"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { UsersRound, HandCoins, Mail, UserPlus, Check, X } from "lucide-react";
import { Group } from "@/types/group";
import { computeMemberNetBalances } from "@/lib/expenses/settlement";
import { formatAmount } from "@/lib/balances";
import { toast } from "@/components/Toast";
import type { IncomingFriendRequest } from "@/types/friend";
import type { CurrentUser } from "@/lib/queries";

type GroupInvitation = {
  id: string;
  group: { id: string; name: string };
  inviter: { id: string; name: string };
  email: string;
  createdAt: string;
};

type DashboardClientProps = {
  user: CurrentUser;
  groups: Group[];
  invitations: GroupInvitation[];
  friendRequests: IncomingFriendRequest[];
};

export default function DashboardClient({
  user,
  groups: initialGroups,
  invitations: initialInvitations,
  friendRequests: initialFriendRequests,
}: DashboardClientProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [invitations, setInvitations] =
    useState<GroupInvitation[]>(initialInvitations);
  const [friendRequests, setFriendRequests] =
    useState<IncomingFriendRequest[]>(initialFriendRequests);
  const [busyIds, setBusyIds] = useState<string[]>([]);

  const loadGroups = useCallback(async () => {
    const response = await fetch("/api/groups");

    if (response.status === 401) {
      window.location.assign("/login");
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to load groups");
    }

    const data = await response.json();

    const normalizedGroups: Group[] = data.map((group: Group) => ({
      ...group,
      members: group.members ?? [],
      expenses: group.expenses ?? [],
      settlements: group.settlements ?? [],
      suggestedSettlements: group.suggestedSettlements ?? [],
    }));

    setGroups(normalizedGroups);

    return normalizedGroups;
  }, []);

  const reloadFriends = useCallback(async () => {
    const response = await fetch("/api/friends");

    if (response.status === 401) {
      window.location.assign("/login");
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to reload friends");
    }

    const data = await response.json();

    setFriendRequests(data.incoming ?? []);
  }, []);

  async function acceptInvitation(invitationId: string) {
    setBusyIds((ids) => [...ids, invitationId]);

    try {
      const response = await fetch(
        `/api/invitations/${invitationId}/accept`,
        { method: "POST" }
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to accept invitation");
      }

      setInvitations((current) =>
        current.filter((item) => item.id !== invitationId)
      );

      await loadGroups();

      toast("You joined the group.", "success");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast(
        error instanceof Error ? error.message : "Failed to accept invitation"
      );
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== invitationId));
    }
  }

  async function rejectInvitation(invitationId: string) {
    setBusyIds((ids) => [...ids, invitationId]);

    try {
      const response = await fetch(
        `/api/invitations/${invitationId}/reject`,
        { method: "POST" }
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to decline invitation");
      }

      setInvitations((current) =>
        current.filter((item) => item.id !== invitationId)
      );

      toast("Invitation declined.", "success");
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast(
        error instanceof Error ? error.message : "Failed to decline invitation"
      );
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== invitationId));
    }
  }

  async function respondToFriendRequest(
    requestId: string,
    action: "accept" | "reject"
  ) {
    setBusyIds((ids) => [...ids, requestId]);

    try {
      const response = await fetch(
        `/api/friends/${requestId}/${action}`,
        { method: "POST" }
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update friend request");
      }

      await reloadFriends();

      toast(
        action === "accept" ? "You are now friends!" : "Request declined.",
        "success"
      );
    } catch (error) {
      console.error("Error responding to friend request:", error);
      toast(
        error instanceof Error ? error.message : "Failed to update request"
      );
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== requestId));
    }
  }

  const requestButtonClass = `
    flex
    items-center
    gap-1.5
    rounded-lg
    px-4
    py-2
    text-sm
    font-medium
    transition-colors
    disabled:opacity-60
  `;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-hk-text">
        Hello, <span className="text-hk-primary">{user.name}</span>
      </h1>

      <p className="mt-1 text-sm text-hk-text-light sm:text-base">
        Here&apos;s a quick look at your groups and balances.
      </p>

      {/* Group Invitations */}
      {invitations.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-hk-primary" />
            <h2 className="text-xl font-bold text-hk-primary">
              Group Invitations
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                  rounded-xl
                  border
                  border-hk-border
                  bg-hk-surface
                  px-5
                  py-4
                "
              >
                <div className="min-w-0">
                  <p className="font-semibold text-hk-text">
                    {invitation.inviter.name} invited you to{" "}
                    <span className="text-hk-primary">
                      {invitation.group.name}
                    </span>
                  </p>
                  <p className="truncate text-sm text-hk-text-light">
                    {invitation.inviter.name} invited you to join their group.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => acceptInvitation(invitation.id)}
                    disabled={busyIds.includes(invitation.id)}
                    className={`${requestButtonClass} bg-hk-primary text-white hover:bg-hk-primary-hover`}
                  >
                    <Check size={16} />
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => rejectInvitation(invitation.id)}
                    disabled={busyIds.includes(invitation.id)}
                    className={`${requestButtonClass} border border-hk-border bg-hk-surface text-hk-text-secondary hover:text-hk-danger`}
                  >
                    <X size={16} />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-hk-primary" />
            <h2 className="text-xl font-bold text-hk-primary">
              Friend Requests
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {friendRequests.map((request) => (
              <div
                key={request.requestId}
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                  rounded-xl
                  border
                  border-hk-border
                  bg-hk-surface
                  px-5
                  py-4
                "
              >
                <div className="min-w-0">
                  <p className="font-semibold text-hk-text">
                    {request.from.name}
                  </p>
                  <p className="truncate text-sm text-hk-text-light">
                    {request.from.email} wants to be your friend
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      respondToFriendRequest(request.requestId, "accept")
                    }
                    disabled={busyIds.includes(request.requestId)}
                    className={`${requestButtonClass} bg-hk-primary text-white hover:bg-hk-primary-hover`}
                  >
                    <Check size={16} />
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      respondToFriendRequest(request.requestId, "reject")
                    }
                    disabled={busyIds.includes(request.requestId)}
                    className={`${requestButtonClass} border border-hk-border bg-hk-surface text-hk-text-secondary hover:text-hk-danger`}
                  >
                    <X size={16} />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center gap-2">
          <HandCoins size={20} className="text-hk-primary" />
          <h2 className="text-xl font-bold text-hk-primary">
            Your Groups
          </h2>
        </div>

        <p className="mt-1 text-sm text-hk-text-light">
          Tap a group to view and manage its expenses.
        </p>

        {groups.length === 0 ? (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-hk-border
              bg-hk-surface
              px-6
              py-10
              text-center
            "
          >
            <p className="text-hk-text-secondary">
              You don&apos;t have any groups yet.
            </p>

            <Link
              href="/groups"
              className="
                mt-4
                inline-block
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
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {groups.map((group) => {
              const balance = computeMemberNetBalances(
                group.expenses,
                group.members,
                group.settlements
              )[user.id] ?? 0;

              const isSettled = Math.abs(balance) < 0.01;

              const balanceLabel = isSettled
                ? "Settled up"
                : balance > 0
                  ? "You are owed"
                  : "You owe";

              const balanceClass = isSettled
                ? "text-hk-text-light"
                : balance > 0
                  ? "text-hk-success"
                  : "text-hk-danger";

              return (
                <Link
                  key={group.id}
                  href="/groups"
                  className="
                    group
                    rounded-xl
                    border
                    border-hk-border
                    bg-hk-surface
                    px-5
                    py-4
                    transition-all
                    hover:border-hk-primary
                    hover:shadow-sm
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-hk-text">
                      {group.name}
                    </h3>

                    <span
                      className="
                        rounded-md
                        bg-hk-surface-secondary
                        px-2
                        py-0.5
                        text-xs
                        font-medium
                        text-hk-text-light
                      "
                    >
                      {group.currency}
                    </span>
                  </div>

                  <p
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1.5
                      text-sm
                      text-hk-text-light
                    "
                  >
                    <UsersRound size={15} />
                    {group.members.length}{" "}
                    {group.members.length === 1 ? "member" : "members"}
                  </p>

                  <p className="mt-3">
                    <span className="text-xs text-hk-text-muted">
                      {balanceLabel}
                    </span>

                    <span
                      className={`block text-lg font-bold ${balanceClass}`}
                    >
                      {isSettled
                        ? "All settled"
                        : formatAmount(Math.abs(balance), group.currency)}
                    </span>
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
