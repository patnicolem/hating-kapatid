"use client";

import { useEffect, useState } from "react";
import { UserPlus, UsersRound, Check, X, Send } from "lucide-react";
import { toast } from "@/components/Toast";
import type {
  FriendUser,
  IncomingFriendRequest,
  OutgoingFriendRequest,
} from "@/types/friend";

export default function FriendsPage() {
  const [email, setEmail] = useState("");
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incoming, setIncoming] = useState<IncomingFriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    try {
      const meResponse = await fetch("/api/auth/me");

      if (meResponse.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!meResponse.ok) {
        throw new Error("Failed to load user");
      }

      const response = await fetch("/api/friends");

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load friends");
      }

      const data = await response.json();

      setFriends(data.friends ?? []);
      setIncoming(data.incoming ?? []);
      setOutgoing(data.outgoing ?? []);
    } catch (error) {
      console.error("Failed to load friends:", error);
      toast(error instanceof Error ? error.message : "Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  }

  async function addFriend() {
    const friendEmail = email.trim();

    if (friendEmail === "") {
      toast("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      toast("Invalid email address.");
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: friendEmail }),
      });

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to add friend");
      }

      setEmail("");
      toast(`Friend request sent to ${friendEmail}.`, "success");
      await loadFriends();
    } catch (error) {
      console.error("Error adding friend:", error);
      toast(error instanceof Error ? error.message : "Failed to add friend");
    } finally {
      setIsAdding(false);
    }
  }

  async function respondToRequest(
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

      toast(
        action === "accept" ? "You are now friends!" : "Request declined.",
        "success"
      );
      await loadFriends();
    } catch (error) {
      console.error("Error responding to friend request:", error);
      toast(
        error instanceof Error ? error.message : "Failed to update request"
      );
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== requestId));
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

  const cardClass = `
    rounded-xl
    border
    border-hk-border
    bg-hk-surface
    px-5
    py-4
  `;

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-hk-text-light">Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-hk-text">Friends</h1>

      <p className="mt-1 text-sm text-hk-text-light sm:text-base">
        Add friends by email, then pick them when inviting members to a group.
      </p>

      {/* Add a friend */}
      <div className={`${cardClass} mt-8`}>
        <div className="flex items-center gap-2">
          <UserPlus size={20} className="text-hk-primary" />
          <h2 className="text-xl font-bold text-hk-primary">Add a Friend</h2>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Friend's Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addFriend();
              }
            }}
            className={inputClass}
          />

          <button
            type="button"
            onClick={addFriend}
            disabled={isAdding}
            className="
              flex
              shrink-0
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
            <Send size={18} />
            Send Request
          </button>
        </div>
      </div>

      {/* Friend requests */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <UsersRound size={20} className="text-hk-primary" />
          <h2 className="text-xl font-bold text-hk-primary">
            Friend Requests
          </h2>
        </div>

        {incoming.length === 0 ? (
          <p className="mt-3 text-sm text-hk-text-light">
            No pending friend requests.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {incoming.map((request) => (
              <div key={request.requestId} className={cardClass}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-hk-text">
                      {request.from.name}
                    </p>
                    <p className="truncate text-sm text-hk-text-light">
                      {request.from.email}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        respondToRequest(request.requestId, "accept")
                      }
                      disabled={busyIds.includes(request.requestId)}
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-lg
                        bg-hk-primary
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-hk-primary-hover
                        disabled:opacity-60
                      "
                    >
                      <Check size={16} />
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        respondToRequest(request.requestId, "reject")
                      }
                      disabled={busyIds.includes(request.requestId)}
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-hk-border
                        bg-hk-surface
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-hk-text-secondary
                        transition-colors
                        hover:text-hk-danger
                        disabled:opacity-60
                      "
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your friends */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <UsersRound size={20} className="text-hk-primary" />
          <h2 className="text-xl font-bold text-hk-primary">
            Your Friends
          </h2>
        </div>

        {friends.length === 0 ? (
          <p className="mt-3 text-sm text-hk-text-light">
            You don&apos;t have any friends yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {friends.map((friend) => (
              <div key={friend.id} className={cardClass}>
                <p className="font-semibold text-hk-text">{friend.name}</p>
                <p className="truncate text-sm text-hk-text-light">
                  {friend.email}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending sent */}
      {outgoing.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-hk-text-secondary">
            Pending Requests Sent
          </h2>

          <div className="mt-4 space-y-3">
            {outgoing.map((request) => (
              <div key={request.requestId} className={cardClass}>
                <p className="font-semibold text-hk-text">{request.to.name}</p>
                <p className="truncate text-sm text-hk-text-light">
                  {request.to.email}
                </p>
                <p className="mt-1 text-xs text-hk-text-muted">
                  Awaiting their response
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}