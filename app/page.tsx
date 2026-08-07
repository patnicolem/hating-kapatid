"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ExpenseForm from "@/components/ExpenseForm";
import MemberList from "@/components/MemberList";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary"
import AddMemberForm from "@/components/AddMemberForm";
import BalanceSummary from "@/components/BalanceSummary";
import { Group, Expense, Member } from "@/types/group";


export default function Home() {
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
  
  // Group State

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
  <main className="flex flex-1 justify-center p-8">

    <div className="flex w-full max-w-7xl gap-8">

      {/* Left Panel */}
      <div className="w-80 h-[75vh] flex flex-col">

        <Sidebar
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />

        <div className="mt-auto pt-6 space-y-4">

          <input
            type="text"
            placeholder="New Expense Group"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
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


      {/* Right Panel */}
      <div
        className="
          flex-1
          bg-white
          rounded-xl
          shadow-sm
          p-8
          h-[75vh]
          overflow-y-auto
        "
      >

        <div
          className="
            bg-white
            rounded-xl
            shadow-sm
            p-8
            h-full
            overflow-y-auto
          "
        >

          <h2 className="text-3xl font-bold text-hk-primary">
            {selectedGroup.name}
          </h2>


          {/* Members */}
          <div className="mt-8">

            <h3 className="text-xl font-bold text-hk-primary mb-4">
              Members
            </h3>

            <MemberList
              members={selectedGroup.members}
            />

            <div className="mt-6">
              <AddMemberForm onAddMember={addMember}
              />
            </div>

          </div>


          {/* Expenses */}
          <div className="mt-10">

            <h3 className="text-xl font-bold text-hk-primary mb-4">
              Expenses
            </h3>

            <div className="mt-6">
              <ExpenseForm
                members={selectedGroup.members}
                onAddExpense={addExpense}
              />
            </div>

            <ExpenseList
              expenses={selectedGroup.expenses}
              members={selectedGroup.members}
            />

            <ExpenseSummary
              members={selectedGroup.members}
              expenses={selectedGroup.expenses}
            />


          </div>

        </div>

      </div>

    </div>

  </main>
);
}

