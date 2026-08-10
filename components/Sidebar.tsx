"use client";

import { Group } from "@/types/group";

interface SidebarProps {
  groups: Group[];
  selectedGroup: Group;
  setSelectedGroup: (group: Group) => void;
}

export default function Sidebar({
  groups,
  selectedGroup,
  setSelectedGroup,
}: SidebarProps) {
  return (
    <aside className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-hk-text">
          Expense Groups
        </h2>

        <p className="mt-1 text-sm text-hk-text-light">
          Select a group to view expenses
        </p>
      </div>

      {/* Group List */}
      <div className="space-y-2">
        {groups.map((group) => {
          const isSelected =
            group.id === selectedGroup.id;

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`
                w-full
                rounded-xl
                border
                px-4
                py-3
                text-left
                transition-all
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-hk-primary
                focus:ring-offset-2
                focus:ring-offset-hk-bg

                ${
                  isSelected
                    ? `
                      border-hk-primary
                      bg-hk-primary
                      text-white
                      shadow-sm
                      hover:bg-hk-primary-hover
                    `
                    : `
                      border-hk-border
                      bg-hk-surface
                      text-hk-text
                      hover:border-hk-primary
                      hover:bg-hk-surface-secondary
                    `
                }
              `}
            >
              <p className="font-semibold">
                {group.name}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}