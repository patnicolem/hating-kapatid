"use client";

import { Member } from "@/types/group";

type MemberListProps = {
  members: Member[];
};

export default function MemberList({
  members,
}: MemberListProps) {
  return (
    <div className="border border-hk-accent rounded-lg overflow-hidden max-w-2xl">

      {members.length === 0 ? (

        <div className="px-4 py-3 text-hk-text-light">
          No members yet.
        </div>

      ) : (

        members.map((member, index) => (

            <div
              key={member.id}
              className={`
                flex
                items-center
                px-4
                py-2
                ${index !== members.length - 1
                  ? "border-b border-hk-accent"
                  : ""}
              `}
            >

            {/* Member Name */}
            <p className="font-semibold text-hk-primary w-1/3">
              {member.name}
            </p>

            {/* Email */}
            <p className="text-hk-text-light text-sm">
              {member.email}
            </p>

          </div>

        ))

      )}

    </div>
  );
}