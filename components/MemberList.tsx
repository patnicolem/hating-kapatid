import { Member } from "@/types/group";

interface MemberListProps {
  members: Member[];
}

export default function MemberList({
  members,
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
            gap-1
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
            <p className="font-semibold text-hk-text">
              {member.name}
            </p>

            <p className="mt-0.5 text-sm text-hk-text-light">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}