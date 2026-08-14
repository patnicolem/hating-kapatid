"use client";

import { Trash2 } from "lucide-react";
import { Member } from "@/types/group";

interface MemberListProps {
  members: Member[];
  onDeleteMember: (memberId: string) => void;
  currentUserId?: string | null;
  canManageMembers: boolean;
}

export default function MemberList({
  members,
  onDeleteMember,
  currentUserId = null,
  canManageMembers,
}: MemberListProps) {
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
      {members.map((member, index) => (
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
        </div>
      ))}
    </div>
  );
}
