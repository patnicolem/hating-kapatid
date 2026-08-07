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
  return (
    <div className="space-y-2">

      {expenses.map((expense) => {

        const payer = members.find(
          (member) => member.id === expense.paidBy
        );

        return (
          <div
            key={expense.id}
            className="
              bg-hk-light
              rounded-lg
              px-4
              py-3
            "
          >

            <div className="flex items-center justify-between gap-4">

              {/* Expense description + shares */}
              <div className="min-w-0">

                <div className="flex items-center gap-2 flex-wrap">

                  <span className="font-semibold">
                    {expense.description}
                  </span>

                  <span className="text-sm text-hk-text-light">
                    — Paid by {payer?.name}
                  </span>

                  <span className="text-sm text-hk-text-light">
                    |
                  </span>

                  <span className="text-sm">
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
                          {index > 0 && ", "}
                          {member.name}: ₱{share.toFixed(2)}
                        </span>
                      );
                    })}
                  </span>

                </div>

              </div>

              {/* Total expense */}
              <span className="font-bold text-hk-primary whitespace-nowrap">
                ₱{expense.amount.toFixed(2)}
              </span>

            </div>

          </div>
        );
      })}

    </div>
  );
}