"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ExpenseForm from "@/components/ExpenseForm";
import MemberList from "@/components/MemberList";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import AddMemberForm from "@/components/AddMemberForm";
import { Group, Expense, Member } from "@/types/group";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "Thailand 2027",
      members: [],
      expenses: [],
    },
    {
      id: 2,
      name: "Apartment Expenses",
      members: [],
      expenses: [],
    },
    {
      id: 3,
      name: "Weekend Gala",
      members: [],
      expenses: [],
    },
  ]);

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);

  function addGroup() {
    if (newGroupName.trim() === "") return;

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      members: [],
      expenses: [],
    };

    setGroups([...groups, newGroup]);
    setSelectedGroup(newGroup);
    setNewGroupName("");
  }

  function addMember(member: Member) {
    const updatedGroup = {
      ...selectedGroup,
      members: [
        ...selectedGroup.members,
        member,
      ],
    };

    setGroups(
      groups.map((group) =>
        group.id === selectedGroup.id
          ? updatedGroup
          : group
      )
    );

    setSelectedGroup(updatedGroup);
  }

  function addExpense(expense: Expense) {
    const updatedGroup = {
      ...selectedGroup,
      expenses: [
        ...selectedGroup.expenses,
        expense,
      ],
    };

    setGroups(
      groups.map((group) =>
        group.id === selectedGroup.id
          ? updatedGroup
          : group
      )
    );

    setSelectedGroup(updatedGroup);
  }

  return (
    <div className="w-full h-full flex gap-6 px-5">

      {/* =========================
          LEFT PANEL
      ========================= */}

      <div className="w-72 flex-shrink-0 flex flex-col">

        <Sidebar
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />

        <div className="mt-6 space-y-3">

          <input
            type="text"
            placeholder="New Expense Group"
            value={newGroupName}
            onChange={(e) =>
              setNewGroupName(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addGroup();
              }
            }}
            className="
              w-full
              bg-white
              border
              border-hk-accent
              rounded-lg
              px-4
              py-2
              focus:outline-none
              focus:ring-2
              focus:ring-hk-secondary
            "
          />

          <button
            onClick={addGroup}
            className="
              w-full
              bg-hk-secondary
              hover:bg-hk-primary
              text-white
              rounded-lg
              py-2
              transition-colors
            "
          >
            Create Group
          </button>

        </div>

      </div>


      {/* =========================
          RIGHT PANEL
      ========================= */}

      <div className="flex-1 min-w-0 h-full">

        {/* Scrollable Group Container */}

        <div
          className="
            w-full
            h-full
            bg-white
            rounded-xl
            shadow-sm
            p-6
            overflow-y-auto
          "
        >

          {/* =========================
              GROUP TITLE
          ========================= */}

          <h2 className="text-3xl font-bold text-hk-primary">
            {selectedGroup.name}
          </h2>


          {/* =========================
              MEMBERS
          ========================= */}

          <div className="mt-6">

            <h3 className="text-xl font-bold text-hk-primary mb-4">
              Members
            </h3>

            <MemberList
              members={selectedGroup.members}
            />

            <div className="mt-4">
              <AddMemberForm
                onAddMember={addMember}
              />
            </div>

          </div>


          {/* =========================
              EXPENSES
          ========================= */}

          <div className="mt-8">

            <h3 className="text-xl font-bold text-hk-primary mb-4">
              Expenses
            </h3>

            <div className="mt-4">

              <ExpenseForm
                members={selectedGroup.members}
                onAddExpense={addExpense}
              />

            </div>


            {/* Expense List + Summary */}

            <div className="mt-6">

              <ExpenseList
                expenses={selectedGroup.expenses}
                members={selectedGroup.members}
              />

              <div className="mt-6">

                <ExpenseSummary
                  members={selectedGroup.members}
                  expenses={selectedGroup.expenses}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}