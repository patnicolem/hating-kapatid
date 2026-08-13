"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Member, MemberRole } from "@/types/group";
import { toast } from "@/components/Toast";

interface MemberListProps {
  members: Member[];
  onDeleteMember: (memberId: string) => void;
  onUpdateMember: (member: Member) => void;
  currentUserId?: string | null;
  canManageMembers: boolean;
}

export default function MemberList({
  members,
  onDeleteMember,
  onUpdateMember,
  currentUserId = null,
  canManageMembers,
}: MemberListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<MemberRole>("MEMBER");

  function startEditing(member: Member) {
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditingId(member.id);
  }

  function saveEdit() {
    if (!editingId) return;

    const name = editName.trim();
    const email = editEmail.trim();

    if (!name || !email) {
      toast("Name and email are required.");
      return;
    }

    onUpdateMember({ id: editingId, name, email, role: editRole });
    setEditingId(null);
  }

  if (members.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border
          border-hk-border
          bg-hk-surface
          px-5
          py-8
          text-center
        "
      >
        <p className="font-medium text-hk-text">
          No members yet
        </p>

        <p className="mt-1 text-sm text-hk-text-light">
          Add members to start sharing expenses.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-hk-border
        bg-hk-surface
      "
    >
      {members.map((member, index) => {
        const isEditing = editingId === member.id;

        return (
          <div
            key={member.id}
            className={`
              flex
              flex-col
              gap-3
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              ${
                index !== members.length - 1
                  ? "border-b border-hk-border"
                  : ""
              }
            `}
          >
            {isEditing ? (
              <>
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEdit();
                      }
                    }}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-hk-border
                      bg-hk-background
                      px-3
                      py-2
                      text-hk-text
                      placeholder:text-hk-text-muted
                      focus:border-hk-primary
                      focus:outline-none
                      focus:ring-2
                      focus:ring-hk-primary/20
                    "
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEdit();
                      }
                    }}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-hk-border
                      bg-hk-background
                      px-3
                      py-2
                      text-hk-text
                      placeholder:text-hk-text-muted
                      focus:border-hk-primary
                      focus:outline-none
                      focus:ring-2
                      focus:ring-hk-primary/20
                    "
                  />
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="
                      rounded-lg
                      bg-hk-primary
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-white
                      transition-colors
                      hover:bg-hk-primary-hover
                    "
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="
                      rounded-lg
                      border
                      border-hk-border
                      bg-hk-background
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-hk-text-secondary
                      transition-colors
                      hover:text-hk-text
                    "
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                              <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-hk-text">
                      {member.name}
                    </p>

                    {member.id === currentUserId && (
                      <span
                        className="
                          rounded-md
                          bg-hk-primary/10
                          px-2
                          py-0.5
                          text-xs
                          font-medium
                          text-hk-primary
                        "
                      >
                        You
                      </span>
                    )}

                    {member.role !== "MEMBER" && (
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
                        {member.role === "OWNER"
                          ? "Owner"
                          : "Admin"}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm text-hk-text-light">
                    {member.email}
                  </p>
                </div>

                {canManageMembers && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(member)}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-hk-border
                        bg-hk-surface
                        text-hk-text-secondary
                        transition-colors
                        hover:border-hk-primary
                        hover:text-hk-primary
                      "
                      aria-label={`Edit ${member.name}`}
                      title="Edit member"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteMember(member.id)}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-hk-border
                        bg-hk-surface
                        text-hk-text-secondary
                        transition-colors
                        hover:border-hk-danger
                        hover:bg-hk-danger/10
                        hover:text-hk-danger
                      "
                      aria-label={`Remove ${member.name}`}
                      title="Remove member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}