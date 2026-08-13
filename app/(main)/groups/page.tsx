"use client";

import { useEffect, useState } from "react";
import { X, UsersRound, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ExpenseForm from "@/components/ExpenseForm";
import MemberList from "@/components/MemberList";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import { toast } from "@/components/Toast";
import InviteMemberForm from "@/components/InviteMemberForm";
import { Group, Expense, Member } from "@/types/group";
import type { FriendUser } from "@/types/friend";

export default function GroupsPage() {

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);


  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCurrency, setNewGroupCurrency] = useState("PHP");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const [friends, setFriends] = useState<FriendUser[]>([]);

  const currentMember =
    selectedGroup?.members.find(
      (member) => member.id === currentUser?.id
    ) ?? null;

  const isAdmin =
    currentMember?.role === "OWNER" ||
    currentMember?.role === "ADMIN";

  const isOwner = currentMember?.role === "OWNER";

  const canManageMembers = Boolean(isAdmin);

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupCurrency, setEditGroupCurrency] = useState("PHP");

  useEffect(() => {
    async function init() {
      try {
        const meResponse = await fetch("/api/auth/me");

        if (meResponse.status === 401) {
          window.location.assign("/login");
          return;
        }

        if (!meResponse.ok) {
          throw new Error("Failed to load user");
        }

        const me = await meResponse.json();

        setCurrentUser(me);

        const response = await fetch("/api/groups");

        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }

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

        const friendsResponse = await fetch("/api/friends");

        if (friendsResponse.status === 401) {
          window.location.assign("/login");
          return;
        }

        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          setFriends(friendsData.friends ?? []);
        }
      } catch (error) {
        console.error("Failed to load groups:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);
  

  async function addGroup() {
    if (!newGroupName.trim()) {
      toast("Group name is required.");
      return;
    }

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

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to create group");
      }

      const newGroup = await response.json();

      const groupWithDefaults: Group = {
        ...newGroup,
        members: newGroup.members ?? [],
        expenses: newGroup.expenses ?? [],
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

  async function inviteMember(email: string) {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/groups/${selectedGroup.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to invite member");
      }

      const result = await response.json();

      toast(
        `Invitation sent to ${result.email}. They'll need to accept it from their account.`,
        "success"
      );
    } catch (error) {
      console.error("Error inviting member:", error);
      toast(error instanceof Error ? error.message : "Failed to invite member");
    }
  }

  async function deleteMember(memberId: string) {
    if (!selectedGroup) return;

    const member = selectedGroup.members.find(
      (item) => item.id === memberId
    );

    if (
      !window.confirm(
        `Remove ${member?.name ?? "member"} from this group?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/groups/${selectedGroup.id}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to remove member");
      }

      const updatedGroup: Group = {
        ...selectedGroup,
        members: selectedGroup.members.filter(
          (member) => member.id !== memberId
        ),
      };

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );

      setSelectedGroup(updatedGroup);
    } catch (error) {
      console.error("Error removing member:", error);
      toast(error instanceof Error ? error.message : "Failed to remove member");
    }
  }

  async function addExpense(expense: Expense) {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/groups/${selectedGroup.id}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: expense.description,
            amount: expense.amount,
            paidBy: expense.paidBy,
            splitType: expense.splitType,
            splits: expense.splits.map((split) => ({
              memberId: split.memberId,
              value: split.value,
            })),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to add expense");
      }

      const createdExpense: Expense = await response.json();

      const updatedGroup: Group = {
        ...selectedGroup,
        expenses: [...selectedGroup.expenses, createdExpense],
      };

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );

      setSelectedGroup(updatedGroup);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast(error instanceof Error ? error.message : "Failed to add expense");
    }
  }

  async function deleteExpense(expenseId: string) {
    if (!selectedGroup) return;

    const expense = selectedGroup.expenses.find(
      (item) => item.id === expenseId
    );

    if (
      !window.confirm(
        `Delete "${expense?.description ?? "expense"}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/groups/${selectedGroup.id}/expenses/${expenseId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to remove expense");
      }

      const updatedGroup: Group = {
        ...selectedGroup,
        expenses: selectedGroup.expenses.filter(
          (expense) => expense.id !== expenseId
        ),
      };

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );

      setSelectedGroup(updatedGroup);
    } catch (error) {
      console.error("Error removing expense:", error);
      toast(error instanceof Error ? error.message : "Failed to remove expense");
    }
  }

  function startEditingGroup() {
    if (!selectedGroup) return;

    setEditGroupName(selectedGroup.name);
    setEditGroupCurrency(selectedGroup.currency);
    setIsEditingGroup(true);
  }

  async function updateGroup() {
    if (!selectedGroup) return;

    const name = editGroupName.trim();

    if (!name) {
      toast("Group name is required.");
      return;
    }

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          currency: editGroupCurrency,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update group");
      }

      const updatedGroup: Group = await response.json();

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        )
      );

      setSelectedGroup(updatedGroup);
      setIsEditingGroup(false);
    } catch (error) {
      console.error("Error updating group:", error);
      toast(error instanceof Error ? error.message : "Failed to update group");
    }
  }

  async function deleteGroup() {
    if (!selectedGroup) return;

    if (!window.confirm(`Delete "${selectedGroup.name}" and all of its data?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete group");
      }

      const remainingGroups = groups.filter(
        (group) => group.id !== selectedGroup.id
      );

      setGroups(remainingGroups);
      setSelectedGroup(remainingGroups[0] ?? null);
      setIsEditingGroup(false);
    } catch (error) {
      console.error("Error deleting group:", error);
      toast(error instanceof Error ? error.message : "Failed to delete group");
    }
  }

  async function updateMember(updatedMember: Member) {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/groups/${selectedGroup.id}/members/${updatedMember.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updatedMember.name,
            email: updatedMember.email,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update member");
      }

      const savedMember: Member = await response.json();

      const updatedGroup: Group = {
        ...selectedGroup,
        members: selectedGroup.members.map((member) =>
          member.id === savedMember.id ? savedMember : member
        ),
      };

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );

      setSelectedGroup(updatedGroup);
    } catch (error) {
      console.error("Error updating member:", error);
      toast(error instanceof Error ? error.message : "Failed to update member");
    }
  }

  async function updateExpense(updatedExpense: Expense) {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `/api/groups/${selectedGroup.id}/expenses/${updatedExpense.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: updatedExpense.description,
            amount: updatedExpense.amount,
            paidBy: updatedExpense.paidBy,
            splitType: updatedExpense.splitType,
            splits: updatedExpense.splits.map((split) => ({
              memberId: split.memberId,
              value: split.value,
            })),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update expense");
      }

      const savedExpense: Expense = await response.json();

      const updatedGroup: Group = {
        ...selectedGroup,
        expenses: selectedGroup.expenses.map((expense) =>
          expense.id === savedExpense.id ? savedExpense : expense
        ),
      };

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );

      setSelectedGroup(updatedGroup);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast(error instanceof Error ? error.message : "Failed to update expense");
    }
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
              {isEditingGroup ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Group name"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateGroup();
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
                    value={editGroupCurrency}
                    onChange={(e) =>
                      setEditGroupCurrency(e.target.value)
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

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={updateGroup}
                      className="
                        rounded-lg
                        bg-hk-primary
                        px-4
                        py-2
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-hk-secondary
                      "
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingGroup(false)}
                      className="
                        rounded-lg
                        border
                        border-hk-border
                        bg-hk-surface
                        px-4
                        py-2
                        font-medium
                        text-hk-text-secondary
                        transition-colors
                        hover:text-hk-text
                      "
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
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

                  <div className="ml-auto flex gap-2">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={startEditingGroup}
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-hk-border
                          bg-hk-surface
                          text-hk-text-secondary
                          transition-colors
                          hover:border-hk-primary
                          hover:text-hk-primary
                        "
                        aria-label="Edit group"
                        title="Edit group"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {isOwner && (
                      <button
                        type="button"
                        onClick={deleteGroup}
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-hk-border
                          bg-hk-surface
                          text-hk-text-secondary
                          transition-colors
                          hover:border-hk-danger
                          hover:bg-hk-danger/10
                          hover:text-hk-danger
                        "
                        aria-label="Delete group"
                        title="Delete group"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

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
                  onDeleteMember={deleteMember}
                  onUpdateMember={updateMember}
                  currentUserId={currentUser?.id ?? null}
                  canManageMembers={canManageMembers}
                />
              </div>

              {canManageMembers && (
                <div className="mt-5">
                  <InviteMemberForm
                    onInvite={inviteMember}
                    friends={friends}
                  />
                </div>
              )}

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
                  currency={selectedGroup.currency}
                />
              </div>


              {/* Expense List */}

              <div className="mt-6">
                <ExpenseList
                  expenses={selectedGroup.expenses}
                  members={selectedGroup.members}
                  currency={selectedGroup.currency}
                  onDeleteExpense={deleteExpense}
                  onUpdateExpense={updateExpense}
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