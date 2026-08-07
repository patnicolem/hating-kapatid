import { Group } from "@/types/group";

type SidebarProps = {
  groups: Group[];
  selectedGroup: Group;
  setSelectedGroup: (group: Group) => void;
};

export default function Sidebar({
  groups,
  selectedGroup,
  setSelectedGroup,
}: SidebarProps) {
  return (
    <aside className="flex flex-col flex-1 min-h-0">

      <h2 className="text-2xl font-bold text-hk-primary mb-4">
        Expense Groups
      </h2>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className={`w-full rounded-lg border p-3 text-left transition
              ${
                selectedGroup.id === group.id
                  ? "bg-hk-primary text-white"
                  : "bg-white hover:bg-hk-light"
              }`}
          >
            {group.name}
          </button>
        ))}
      </div>

    </aside>
  );
}