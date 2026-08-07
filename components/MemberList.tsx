import { Member } from "@/types/group";

type MemberListProps = {
  members: Member[];
};

export default function MemberList({
  members,
}: MemberListProps) {
  return (
    <div className="space-y-2 mb-6">

      {members.map((member) => (
        <div
          key={member.id}
          className="bg-hk-light rounded-lg p-4"
        >
          <p className="font-medium">
            {member.name}
          </p>

          <p className="text-sm text-hk-text-light">
            {member.email}
          </p>
        </div>
      ))}

    </div>
  );
}