"use client";

import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Member, Expense } from "@/types/group";

type ExpenseFormProps = {
  members: Member[];
  onAddExpense: (expense: Expense) => void;
};

export default function ExpenseForm({
  members,
  onAddExpense,
}: ExpenseFormProps) {

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [splitType, setSplitType] =
    useState<"even" | "amount" | "percent">("even");

  const [selectedMemberIds, setSelectedMemberIds] =
    useState<number[]>([]);

  const [splitValues, setSplitValues] =
    useState<Record<number, number>>({});


  function handleSubmit() {

    if (
      description.trim() === "" ||
      amount === "" ||
      paidBy === ""
    ) {
      return;
    }

    if (selectedMemberIds.length === 0) {
      alert("Please select at least one member.");
      return;
    }

    const expenseAmount = Number(amount);

    let splits: {
      memberId: number;
      value: number;
    }[] = [];


    // EVEN SPLIT
    if (splitType === "even") {

      const amountPerMember =
        expenseAmount / selectedMemberIds.length;

      splits = selectedMemberIds.map((memberId) => ({
        memberId,
        value: amountPerMember,
      }));

    }


    // AMOUNT SPLIT
    if (splitType === "amount") {

      const totalSplitAmount =
        selectedMemberIds.reduce(
          (total, memberId) =>
            total + (splitValues[memberId] ?? 0),
          0
        );

      if (
        Math.abs(totalSplitAmount - expenseAmount) > 0.01
      ) {
        alert(
          `Split amounts must equal ₱${expenseAmount.toFixed(2)}`
        );
        return;
      }

      splits = selectedMemberIds.map((memberId) => ({
        memberId,
        value: splitValues[memberId] ?? 0,
      }));

    }


    // PERCENTAGE SPLIT
    if (splitType === "percent") {

      const totalPercentage =
        selectedMemberIds.reduce(
          (total, memberId) =>
            total + (splitValues[memberId] ?? 0),
          0
        );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        alert("Percentages must add up to 100%.");
        return;
      }

      splits = selectedMemberIds.map((memberId) => ({
        memberId,
        value: splitValues[memberId] ?? 0,
      }));

    }


    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount: expenseAmount,
      paidBy: Number(paidBy),
      splitType,
      splits,
    };

    onAddExpense(newExpense);


    // Reset form

    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitType("even");
    setSelectedMemberIds([]);
    setSplitValues({});
  }


  return (

    <div className="space-y-3 max-w-2xl">


      {/* Description + Amount */}

      <div className="flex items-center gap-2">

        <input
          type="text"
          placeholder="Expense Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="
            flex-1
            bg-white
            border
            border-hk-accent
            rounded-lg
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-hk-secondary
          "
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="
            w-32
            bg-white
            border
            border-hk-accent
            rounded-lg
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-hk-secondary
          "
        />

      </div>


      {/* Who Paid + Split Type */}

      <div className="flex items-center gap-2">

        <select
          value={paidBy}
          onChange={(e) =>
            setPaidBy(e.target.value)
          }
          className="
            flex-1
            bg-white
            border
            border-hk-accent
            rounded-lg
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-hk-secondary
          "
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
                | "even"
                | "amount"
                | "percent"
            )
          }
          className="
            flex-1
            bg-white
            border
            border-hk-accent
            rounded-lg
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-hk-secondary
          "
        >

          <option value="even">
            Split Evenly
          </option>

          <option value="amount">
            Split by Amount
          </option>

          <option value="percent">
            Split by Percentage
          </option>

        </select>

      </div>


      {/* Members participating in split */}

      <div
        className="
          border
          border-hk-accent
          rounded-lg
          p-3
        "
      >

        <p className="font-medium mb-2">
          Split Between
        </p>

        <div className="space-y-1">

          {members.map((member) => (

            <label
              key={member.id}
              className="
                flex
                items-center
                gap-3
                py-1
                cursor-pointer
              "
            >

              <input
                type="checkbox"
                checked={selectedMemberIds.includes(
                  member.id
                )}
                onChange={(e) => {

                  if (e.target.checked) {

                    setSelectedMemberIds([
                      ...selectedMemberIds,
                      member.id,
                    ]);

                  } else {

                    setSelectedMemberIds(
                      selectedMemberIds.filter(
                        (id) => id !== member.id
                      )
                    );

                  }

                }}
              />

              <span>
                {member.name}
              </span>

            </label>

          ))}

        </div>

      </div>


      {/* Amount / Percentage values */}

      {splitType !== "even" && (

        <div
          className="
            border
            border-hk-accent
            rounded-lg
            p-3
          "
        >

          <p className="font-medium mb-2">
            {splitType === "amount"
              ? "Amount per member"
              : "Percentage per member"}
          </p>

          <div className="space-y-2">

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
                    items-center
                    gap-3
                  "
                >

                  <span className="w-24">
                    {member.name}
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      splitValues[member.id] ?? ""
                    }
                    onChange={(e) => {

                      setSplitValues({
                        ...splitValues,
                        [member.id]:
                          Number(e.target.value),
                      });

                    }}
                    className="
                      flex-1
                      bg-white
                      border
                      border-hk-accent
                      rounded-lg
                      px-3
                      py-2
                      focus:outline-none
                      focus:ring-2
                      focus:ring-hk-secondary
                    "
                    placeholder={
                      splitType === "amount"
                        ? "Amount"
                        : "%"
                    }
                  />

                  {splitType === "percent" && (
                    <span>%</span>
                  )}

                </div>

              ))}

          </div>

        </div>

      )}


      {/* Add Expense */}

      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-hk-secondary
            hover:bg-hk-primary
            text-white
            rounded-lg
            px-6
            py-2
            transition-colors
          "
        >
          <CirclePlus size={18} />
          Add Expense
        </button>
      </div>

    </div>

  );
}