type Group = {
    name: string;
};

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
        <aside     
            className="
            w-80
            h-[75vh]
            flex
            flex-col
            border-r
            border-hk-accent
            pr-6
            "
        >
            <h2 className="text-2xl font-bold space-y-6 text-hk-primary">
                Expense Groups
            </h2>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                {groups.map((group) => (
                    <button
                        key={group.name}
                        onClick={() => setSelectedGroup(group)}
                        className={`w-full rounded-lg border p-3 text-left transition
                        ${
                            selectedGroup.name === group.name
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