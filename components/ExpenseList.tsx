"use client";

import { Expense, Member } from "@/types/group";

type ExpenseListProps = {
  expenses: Expense[];
  members: Member[];
  currency: string;
};

export default function ExpenseList({
  expenses,
  members,
  currency,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border
          border-hk-border
          bg-hk-surface
          px-5
          py-8
          text-center
        "
      >
        <p className="font-medium text-hk-text">
          No expenses yet
        </p>

        <p className="mt-1 text-sm text-hk-text-light">
          Add an expense above to start tracking your group spending.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const payer = members.find(
          (member) => member.id === expense.paidBy
        );

        return (
          <div
            key={expense.id}
            className="
              rounded-xl
              border
              border-hk-border
              bg-hk-surface
              p-4
              transition-colors
              hover:border-hk-accent
            "
          >
            {/* Expense information */}
            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p className="font-semibold text-hk-text">
                  {expense.description}
                </p>

                <p className="mt-1 text-sm text-hk-text-light">
                  Paid by{" "}
                  <span className="font-medium text-hk-text-secondary">
                    {payer?.name ?? "Unknown"}
                  </span>
                </p>
              </div>

              <p className="text-lg font-bold text-hk-primary">
                {currency} {expense.amount.toFixed(2)}
              </p>
            </div>

            {/* Individual shares */}
            <div
              className="
                mt-4
                border-t
                border-hk-border
                pt-3
              "
            >
              <p className="mb-2 text-sm font-medium text-hk-text">
                Split
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {expense.splits.map((split) => {
                  const member = members.find(
                    (member) => member.id === split.memberId
                  );

                  if (!member) return null;

                  const share =
                    expense.splitType === "PERCENT"
                      ? expense.amount * (split.value / 100)
                      : split.value;

                  return (
                    <span
                      key={split.memberId}
                      className="
                        rounded-md
                        bg-hk-background
                        px-2.5
                        py-1
                        text-sm
                        text-hk-text-secondary
                      "
                    >
                      {member.name}:{" "}
                      <span className="font-medium text-hk-text">
                        {currency} {share.toFixed(2)}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}