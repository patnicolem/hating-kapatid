"use client";

import { Expense, Member } from "@/types/group";

type ExpenseListProps = {
  expenses: Expense[];
  members: Member[];
};

export default function ExpenseList({
  expenses,
  members,
}: ExpenseListProps) {

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-hk-text-light">
        No expenses yet.
      </p>
    );
  }

  return (
    <div className="border border-hk-accent rounded-lg overflow-hidden bg-white">

      {expenses.map((expense, index) => {

        const payer = members.find(
          (member) => member.id === expense.paidBy
        );

        return (
          <div
            key={expense.id}
            className={`
              px-4
              py-3
              ${index !== expenses.length - 1
                ? "border-b border-hk-accent"
                : ""}
            `}
          >

            {/* Expense information */}
            <div className="flex justify-between items-center">

              <div>

                <p className="font-medium text-hk-primary">
                  {expense.description}
                </p>

                <p className="text-sm text-hk-text-light">
                  Paid by {payer?.name}
                </p>

              </div>

              <p className="font-bold text-hk-primary">
                ₱{expense.amount.toFixed(2)}
              </p>

            </div>


            {/* Individual shares */}
            <div className="mt-1 text-sm text-hk-text-light">

              {expense.splits.map((split, index) => {

                const member = members.find(
                  (member) => member.id === split.memberId
                );

                if (!member) return null;

                const share =
                  expense.splitType === "percent"
                    ? expense.amount * (split.value / 100)
                    : split.value;

                return (
                  <span key={split.memberId}>

                    {index > 0 && " | "}

                    {member.name}: ₱{share.toFixed(2)}

                  </span>
                );

              })}

            </div>

          </div>
        );

      })}

    </div>
  );
}