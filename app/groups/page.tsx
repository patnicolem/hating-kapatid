"use client";

import { useState } from "react";
import { X, UsersRound } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function addGroup() {
    if (newGroupName.trim() === "") return;

    const newGroup: Group = {
      id: Date.now(),
      name: newGroupName.trim(),
      members: [],
      expenses: [],
    };

    setGroups([...groups, newGroup]);
    setSelectedGroup(newGroup);
    setNewGroupName("");
  }

  function addMember(member: Member) {
    const updatedGroup: Group = {
      ...selectedGroup,
      members: [...selectedGroup.members, member],
    };

    setGroups(
      groups.map((group) =>
        group.id === selectedGroup.id ? updatedGroup : group
      )
    );

    setSelectedGroup(updatedGroup);
  }

  function addExpense(expense: Expense) {
    const updatedGroup: Group = {
      ...selectedGroup,
      expenses: [...selectedGroup.expenses, expense],
    };

    setGroups(
      groups.map((group) =>
        group.id === selectedGroup.id ? updatedGroup : group
      )
    );

    setSelectedGroup(updatedGroup);
  }

  return (
    <div
      className="
        flex
        h-full
        gap-6
        p-6
      "
    >




{/* =========================
    DESKTOP SIDEBAR
========================= */}

<div className="hidden w-72 shrink-0 flex-col md:flex">

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
        rounded-lg
        border
        border-hk-accent
        bg-hk-surface
        px-4
        py-2
        text-hk-text
        placeholder:text-hk-text-light
        focus:outline-none
        focus:ring-2
        focus:ring-hk-secondary
      "
    />

    <button
      onClick={addGroup}
      className="
        w-full
        rounded-lg
        bg-hk-primary
        py-2
        text-white
        transition-colors
        hover:bg-hk-secondary
      "
    >
      Create Group
    </button>

  </div>

</div>


      {/* =========================
          MOBILE SIDEBAR DRAWER
      ========================= */}

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          {/* Overlay */}
          <div
            className="
              absolute
              inset-0
              bg-black/60
            "
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer */}
          <div
            className="
              absolute
              left-0
              top-0
              h-full
              w-72
              max-w-[85vw]
              overflow-y-auto
              border-r
              border-hk-border
              bg-hk-background
              p-4
              shadow-xl
            "
          >

            {/* Drawer Header */}
            <div className="mb-4 flex items-center">

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-hk-border
                  bg-hk-surface
                  text-hk-text-secondary
                  shadow-sm
                  transition-colors
                  hover:border-hk-primary
                  hover:bg-hk-surface-secondary
                  hover:text-hk-primary
                "
                aria-label="Close expense groups"
              >
                <X size={20} />
              </button>

            </div>


            {/* Sidebar */}
            <Sidebar
              groups={groups}
              selectedGroup={selectedGroup}
              setSelectedGroup={(group) => {
                setSelectedGroup(group);
                setIsSidebarOpen(false);
              }}
            />


            {/* Create Group */}
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
                    setIsSidebarOpen(false);
                  }
                }}
                className="
                  w-full
                  rounded-lg
                  border
                  border-hk-accent
                  bg-hk-surface
                  px-4
                  py-2
                  text-hk-text
                  placeholder:text-hk-text-light
                  focus:outline-none
                  focus:ring-2
                  focus:ring-hk-secondary
                "
              />

              <button
                onClick={() => {
                  addGroup();
                  setIsSidebarOpen(false);
                }}
                className="
                  w-full
                  rounded-lg
                  bg-hk-primary
                  py-2
                  text-white
                  transition-colors
                  hover:bg-hk-secondary
                "
              >
                Create Group
              </button>

            </div>

          </div>
        </div>
      )}


      {/* =========================
          RIGHT PANEL
      ========================= */}

      <div className="w-full min-w-0 flex-1">

        {/* Group Container */}

        <div
          className="
            relative
            w-full
            rounded-xl
            bg-hk-background
            p-4
            shadow-sm
            sm:p-6
            md:h-full
            md:overflow-y-auto
          "
        >

          {/* Mobile Group Switcher */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="
              absolute
              right-4
              top-4
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              border
              border-hk-border
              bg-hk-surface
              text-hk-primary
              shadow-sm
              transition-colors
              hover:border-hk-primary
              hover:bg-hk-surface-secondary
              sm:right-6
              sm:top-6
              md:hidden
            "
            aria-label="Switch expense group"
            title="Expense Groups"
          >
            <UsersRound size={20} />
          </button>

          {/* =========================
              GROUP TITLE
          ========================= */}

          <h2 className="pr-12 text-2xl font-bold text-hk-primary sm:text-3xl">
            {selectedGroup.name}
          </h2>

          <p className="mt-1 text-sm text-hk-text-light sm:text-base">
            Manage members, expenses, and balances.
          </p>


          {/* =========================
              MEMBERS
          ========================= */}

          <div className="mt-8">

            <h3 className="text-xl font-bold text-hk-primary">
              Members
            </h3>

            <p className="mt-1 text-hk-text-light">
              People included in this expense group.
            </p>

            <div className="mt-5">

              <MemberList
                members={selectedGroup.members}
              />

            </div>

            <div className="mt-5">

              <AddMemberForm
                onAddMember={addMember}
              />

            </div>

          </div>


          {/* =========================
              EXPENSES
          ========================= */}

          <div className="mt-10">

            <h3 className="text-xl font-bold text-hk-primary">
              Expenses
            </h3>

            <p className="mt-1 text-hk-text-light">
              Add and track shared expenses for this group.
            </p>

            <div className="mt-5">

              <ExpenseForm
                members={selectedGroup.members}
                onAddExpense={addExpense}
              />

            </div>


            {/* Expense List */}

            <div className="mt-6">

              <ExpenseList
                expenses={selectedGroup.expenses}
                members={selectedGroup.members}
              />

            </div>


            {/* Expense Summary */}

            <div className="mt-8">

              <ExpenseSummary
                members={selectedGroup.members}
                expenses={selectedGroup.expenses}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}