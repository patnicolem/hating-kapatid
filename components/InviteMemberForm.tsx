"use client";

import { useState } from "react";
import { Send, UserPlus } from "lucide-react";
import { toast } from "@/components/Toast";
import type { FriendUser } from "@/types/friend";

type InviteMemberFormProps = {
  onInvite: (email: string) => void;
  friends?: FriendUser[];
};

export default function InviteMemberForm({
  onInvite,
  friends = [],
}: InviteMemberFormProps) {
  const [email, setEmail] = useState("");

  function handleSubmit() {
    const memberEmail = email.trim();

    if (memberEmail === "") {
      toast("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
      toast("Invalid email address.");
      return;
    }

    onInvite(memberEmail);

    setEmail("");
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
    <div className="space-y-3">
      {friends.length > 0 && (
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-hk-text-light">
            <UserPlus size={14} />
            Pick from your friends
          </label>

          <select
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a friend (optional)</option>

            {friends.map((friend) => (
              <option key={friend.id} value={friend.email}>
                {friend.name} ({friend.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        className={inputClass}
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          className="
            flex
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
            focus:outline-none
            focus:ring-2
            focus:ring-hk-primary
            focus:ring-offset-2
            focus:ring-offset-hk-bg
          "
        >
          <Send size={18} />
          Invite Member
        </button>
      </div>
    </div>
  );
}