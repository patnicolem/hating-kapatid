"use client";

import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Member, Expense } from "@/types/group";
import { toast } from "@/components/Toast";

type ExpenseFormProps = {
  members: Member[];
  onAddExpense: (expense: Expense) => void;
  currency: string;
  editingExpense?: Expense | null;
  onUpdateExpense?: (expense: Expense) => void;
  onCancelEdit?: () => void;
};

export default function ExpenseForm({
  members,
  onAddExpense,
  currency,
  editingExpense = null,
  onUpdateExpense,
  onCancelEdit,
}: ExpenseFormProps) {
  const isEditing = editingExpense !== null;

  const [description, setDescription] = useState(
    editingExpense?.description ?? ""
  );
  const [amount, setAmount] = useState(
    editingExpense ? String(editingExpense.amount) : ""
  );
  const [paidBy, setPaidBy] = useState(
    editingExpense?.paidBy ?? ""
  );

  const [splitType, setSplitType] =
    useState<"EQUAL" | "AMOUNT" | "PERCENT">(
      editingExpense?.splitType ?? "EQUAL"
    );

  const [selectedMemberIds, setSelectedMemberIds] =
    useState<string[]>(
      editingExpense?.splits.map((split) => split.memberId) ?? []
    );

  const [splitValues, setSplitValues] =
    useState<Record<string, number>>(() => {
      if (!editingExpense) return {};

      return Object.fromEntries(
        editingExpense.splits.map((split) => [
          split.memberId,
          split.value,
        ])
      );
    });

  function resetForm() {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(String(editingExpense.amount));
      setPaidBy(editingExpense.paidBy);
      setSplitType(editingExpense.splitType);
      setSelectedMemberIds(
        editingExpense.splits.map((split) => split.memberId)
      );
      setSplitValues(
        Object.fromEntries(
          editingExpense.splits.map((split) => [
            split.memberId,
            split.value,
          ])
        )
      );
    } else {
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitType("EQUAL");
      setSelectedMemberIds([]);
      setSplitValues({});
    }
  }

  function handleSubmit() {
    if (description.trim() === "") {
      toast("Description is required.");
      return;
    }

    if (amount === "") {
      toast("Amount is required.");
      return;
    }

    if (paidBy === "") {
      toast("Please select who paid.");
      return;
    }

    if (selectedMemberIds.length === 0) {
      toast("Please select at least one member.");
      return;
    }

    const expenseAmount = Number(amount);

    if (expenseAmount <= 0) {
      toast("Expense amount must be greater than zero.");
      return;
    }

    let splits: {
      memberId: string;
      value: number;
    }[] = [];

    // =========================
    // EQUAL SPLIT
    // =========================

    if (splitType === "EQUAL") {
      const amountPerMember =
        expenseAmount / selectedMemberIds.length;

      splits = selectedMemberIds.map((memberId) => ({
        memberId,
        value: amountPerMember,
      }));
    }

    // =========================
    // AMOUNT SPLIT
    // =========================

    if (splitType === "AMOUNT") {
      const totalSplitAmount =
        selectedMemberIds.reduce(
          (total, memberId) =>
            total + (splitValues[memberId] ?? 0),
          0
        );

      if (
        Math.abs(totalSplitAmount - expenseAmount) > 0.01
      ) {
        toast(
          `Split amounts must equal ${formatCurrency(expenseAmount)}`
        );
        return;
      }

      splits = selectedMemberIds.map((memberId) => ({
        memberId,
        value: splitValues[memberId] ?? 0,
      }));
    }

    // =========================
    // PERCENTAGE SPLIT
    // =========================

    if (splitType === "PERCENT") {
      const totalPercentage =
        selectedMemberIds.reduce(
          (total, memberId) =>
            total + (splitValues[memberId] ?? 0),
          0
        );

      if (
        Math.abs(totalPercentage - 100) > 0.01
      ) {
        toast("Percentages must add up to 100%.");
        return;
      }

      splits = selectedMemberIds.map((memberId) => ({
        memberId,
        value: splitValues[memberId] ?? 0,
      }));
    }

    const newExpense: Expense = {
      id: editingExpense?.id ?? crypto.randomUUID(),
      description: description.trim(),
      amount: expenseAmount,
      paidBy,
      splitType,
      splits,
    };

    if (isEditing && onUpdateExpense) {
      onUpdateExpense(newExpense);
    } else {
      onAddExpense(newExpense);
    }

    resetForm();
  }

  const inputClass = `
    w-full
    rounded-lg
    border
    border-hk-border
    bg-hk-surface
    px-3
    py-2.5
    text-hk-text
    placeholder:text-hk-text-muted
    transition-colors
    focus:border-hk-primary
    focus:outline-none
    focus:ring-2
    focus:ring-hk-primary/20
  `;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Description + Amount */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
        <input
          type="text"
          placeholder="Expense Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className={inputClass}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className={inputClass}
        />
      </div>

      {/* Who Paid + Split Type */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={paidBy}
          onChange={(e) =>
            setPaidBy(e.target.value)
          }
          className={inputClass}
        >
          <option value="">
            Who paid?
          </option>

          {members.map((member) => (
            <option
              key={member.id}
              value={member.id}
            >
              {member.name}
            </option>
          ))}
        </select>

        <select
          value={splitType}
          onChange={(e) =>
            setSplitType(
              e.target.value as
                | "EQUAL"
                | "AMOUNT"
                | "PERCENT"
            )
          }
          className={inputClass}
        >
          <option value="EQUAL">
            Split Evenly
          </option>

          <option value="AMOUNT">
            Split by Amount
          </option>

          <option value="PERCENT">
            Split by Percentage
          </option>
        </select>
      </div>

      {/* Members participating in split */}
      <div
        className="
          rounded-xl
          border
          border-hk-border
          bg-hk-surface-secondary
          p-4
        "
      >
        <p className="mb-3 font-semibold text-hk-text">
          Split Between
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {members.map((member) => (
            <label
              key={member.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                rounded-lg
                px-3
                py-2
                text-hk-text-secondary
                transition-colors
                hover:bg-hk-surface
                hover:text-hk-text
              "
            >
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(
                  member.id
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMemberIds(
                      (current) => [
                        ...current,
                        member.id,
                      ]
                    );
                  } else {
                    setSelectedMemberIds(
                      (current) =>
                        current.filter(
                          (id) => id !== member.id
                        )
                    );
                  }
                }}
                className="
                  h-4
                  w-4
                  cursor-pointer
                  accent-hk-primary
                "
              />

              <span>{member.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount / Percentage values */}
      {splitType !== "EQUAL" && (
        <div
          className="
            rounded-xl
            border
            border-hk-border
            bg-hk-surface-secondary
            p-4
          "
        >
          <p className="mb-3 font-semibold text-hk-text">
            {splitType === "AMOUNT"
              ? "Amount per member"
              : "Percentage per member"}
          </p>

          <div className="space-y-3">
            {members
              .filter((member) =>
                selectedMemberIds.includes(
                  member.id
                )
              )
              .map((member) => (
                <div
                  key={member.id}
                  className="
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:items-center
                    sm:gap-4
                  "
                >
                  <span
                    className="
                      w-24
                      shrink-0
                      text-hk-text-secondary
                    "
                  >
                    {member.name}
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      splitValues[member.id] ?? ""
                    }
                    onChange={(e) => {
                      setSplitValues(
                        (current) => ({
                          ...current,
                          [member.id]:
                            Number(
                              e.target.value
                            ),
                        })
                      );
                    }}
                    className={`${inputClass} sm:w-64`}
                    placeholder={
                      splitType === "AMOUNT"
                        ? "Amount"
                        : "%"
                    }
                  />

                  {splitType === "PERCENT" && (
                    <span className="text-hk-text-muted">
                      %
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Expense */}
      <div className="flex justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-hk-primary
            px-6
            py-2.5
            font-medium
            text-white
            transition-colors
            hover:bg-hk-primary-hover
            focus:outline-none
            focus:ring-2
            focus:ring-hk-primary
            focus:ring-offset-2
            focus:ring-offset-hk-bg
          "
        >
          <CirclePlus size={18} />
          {isEditing ? "Save Changes" : "Add Expense"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="
              rounded-lg
              border
              border-hk-border
              bg-hk-surface
              px-6
              py-2.5
              font-medium
              text-hk-text-secondary
              transition-colors
              hover:text-hk-text
            "
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}