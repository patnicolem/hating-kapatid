"use client";

import { useEffect, useState } from "react";
import { X, UsersRound } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ExpenseForm from "@/components/ExpenseForm";
import MemberList from "@/components/MemberList";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import AddMemberForm from "@/components/AddMemberForm";
import { Group, Expense, Member } from "@/types/group";

export default function GroupsPage() {

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);


  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCurrency, setNewGroupCurrency] = useState("PHP");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      try {
        const response = await fetch("/api/groups");

        if (!response.ok) {
          throw new Error("Failed to load groups");
        }

        const data = await response.json();

        const normalizedGroups: Group[] = data.map((group: Group) => ({
          ...group,
          members: group.members ?? [],
          expenses: group.expenses ?? [],
        }));

        setGroups(normalizedGroups);

        if (normalizedGroups.length > 0) {
          setSelectedGroup(normalizedGroups[0]);
        }
      } catch (error) {
        console.error("Failed to load groups:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGroups();
  }, []);
  

  async function addGroup() {
    if (!newGroupName.trim()) return;

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          currency: newGroupCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const newGroup = await response.json();

      const groupWithDefaults: Group = {
        ...newGroup,
        members: [],
        expenses: [],
      };

      setGroups((currentGroups) => [
        ...currentGroups,
        groupWithDefaults,
      ]);

      setSelectedGroup(groupWithDefaults);

      // Reset form
      setNewGroupName("");
      setNewGroupCurrency("PHP");

      // Close mobile drawer
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }

  function addMember(member: Omit<Member, "id">) {
    if (!selectedGroup) return;

    const newMember: Member = {
      id: crypto.randomUUID(),
      ...member,
    };

    const updatedGroup: Group = {
      ...selectedGroup,
      members: [...selectedGroup.members, newMember],
    };

    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === selectedGroup.id ? updatedGroup : group
      )
    );

    setSelectedGroup(updatedGroup);
  }

  function addExpense(expense: Expense) {
    if (!selectedGroup) return;

    const updatedGroup: Group = {
      ...selectedGroup,
      expenses: [...selectedGroup.expenses, expense],
    };

    setGroups((currentGroups) =>
      currentGroups.map((group) =>
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

          <select
            value={newGroupCurrency}
            onChange={(e) => setNewGroupCurrency(e.target.value)}
            className="
              w-full
              rounded-lg
              border
              border-hk-accent
              bg-hk-surface
              px-4
              py-2
              text-hk-text
              focus:outline-none
              focus:ring-2
              focus:ring-hk-secondary
            "
          >
            <option value="PHP">PHP</option>
            <option value="THB">THB</option>
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
            <option value="SGD">SGD</option>
            <option value="TWD">TWD</option>
            <option value="JPY">JPY</option>
            <option value="EUR">EUR</option>
          </select>

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

              {/* Currency */}
              <select
                value={newGroupCurrency}
                onChange={(e) =>
                  setNewGroupCurrency(e.target.value)
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-hk-accent
                  bg-hk-surface
                  px-4
                  py-2
                  text-hk-text
                  focus:outline-none
                  focus:ring-2
                  focus:ring-hk-secondary
                "
              >
                <option value="PHP">PHP</option>
                <option value="THB">THB</option>
                <option value="USD">USD</option>
                <option value="AUD">AUD</option>
                <option value="SGD">SGD</option>
                <option value="TWD">TWD</option>
                <option value="JPY">JPY</option>
                <option value="EUR">EUR</option>
              </select>

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
            LOADING / NO GROUP / GROUP CONTENT
        ========================= */}

        {isLoading ? (
          <div className="flex min-h-75 items-center justify-center">
            <p className="text-hk-text-light">
              Loading expense groups...
            </p>
          </div>
        ) : !selectedGroup ? (
          <div className="flex min-h-75 flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-hk-primary sm:text-3xl">
              No expense group selected
            </h2>

            <p className="mt-2 max-w-md text-sm text-hk-text-light sm:text-base">
              Create an expense group or select an existing group to get started.
            </p>

            {/* Mobile only */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="
                mt-5
                rounded-lg
                bg-hk-primary
                px-5
                py-2.5
                font-medium
                text-white
                transition-colors
                hover:bg-hk-secondary
                md:hidden
              "
            >
              Select Expense Group
            </button>
          </div>
        ) : (
          <>
            {/* =========================
                GROUP TITLE
            ========================= */}

            <div className="pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-hk-primary sm:text-3xl">
                  {selectedGroup.name}
                </h2>

                <span
                  className="
                    rounded-md
                    bg-hk-surface-secondary
                    px-2
                    py-1
                    text-xs
                    font-medium
                    text-hk-text-light
                  "
                >
                  {selectedGroup.currency}
                </span>
              </div>

              <p className="mt-1 text-sm text-hk-text-light sm:text-base">
                Manage members, expenses, and balances.
              </p>
            </div>


            {/* =========================
                MEMBERS
            ========================= */}

            <div className="mt-8">

              <h3 className="text-xl font-bold text-hk-primary">
                Members
              </h3>

              <p className="mt-1 text-sm text-hk-text-light sm:text-base">
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

              <p className="mt-1 text-sm text-hk-text-light sm:text-base">
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
                  currency={selectedGroup.currency}
                />
              </div>


              {/* Expense Summary */}

              <div className="mt-8">
                <ExpenseSummary
                  members={selectedGroup.members}
                  expenses={selectedGroup.expenses}
                  currency={selectedGroup.currency}
                />
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
}