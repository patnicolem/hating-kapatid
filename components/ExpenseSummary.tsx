"use client";

import { Expense, Member } from "@/types/group";
import BalanceSummary from "@/components/BalanceSummary";

type ExpenseSummaryProps = {
  members: Member[];
  expenses: Expense[];
};

export default function ExpenseSummary({
  members,
  expenses,
}: ExpenseSummaryProps) {
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const memberSummaries = members.map((member) => {
    // How much this member actually paid
    const totalPaid = expenses
      .filter(
        (expense) => expense.paidBy === member.id
      )
      .reduce(
        (total, expense) => total + expense.amount,
        0
      );

    // How much this member is responsible for
    const totalOwed = expenses.reduce(
      (total, expense) => {
        const split = expense.splits.find(
          (split) => split.memberId === member.id
        );

        if (!split) {
          return total;
        }

        if (expense.splitType === "percent") {
          return (
            total +
            expense.amount * (split.value / 100)
          );
        }

        return total + split.value;
      },
      0
    );

    const netBalance = totalPaid - totalOwed;

    return {
      member,
      totalPaid,
      totalOwed,
      netBalance,
    };
  });

  return (
    <div className="space-y-5">

      {/* Section title */}
      <div>
        <h3 className="text-xl font-bold text-hk-primary">
          Expense Summary
        </h3>

        <p className="mt-1 text-sm text-hk-text-light">
          See how much everyone has paid and owes.
        </p>
      </div>

      {/* Total Expenses */}
      <div
        className="
          rounded-xl
          border
          border-hk-border
          bg-hk-surface
          px-5
          py-4
        "
      >
        <p className="text-sm text-hk-text-light">
          Total Group Expenses
        </p>

        <p className="mt-1 text-3xl font-bold text-hk-primary">
          ₱{totalExpenses.toFixed(2)}
        </p>
      </div>

      {/* Individual Summary */}
      {memberSummaries.length > 0 && (
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-hk-border
            bg-hk-surface
          "
        >
          {memberSummaries.map(
            (summary, index) => (
              <div
                key={summary.member.id}
                className={`
                  grid
                  grid-cols-1
                  gap-3
                  px-5
                  py-4
                  sm:grid-cols-4
                  sm:items-center
                  sm:gap-4
                  ${
                    index !==
                    memberSummaries.length - 1
                      ? "border-b border-hk-border"
                      : ""
                  }
                `}
              >
                {/* Member */}
                <div>
                  <p className="font-semibold text-hk-text">
                    {summary.member.name}
                  </p>
                </div>

                {/* Paid */}
                <div>
                  <p className="text-xs text-hk-text-light">
                    Paid
                  </p>

                  <p className="mt-0.5 font-medium text-hk-text">
                    ₱{summary.totalPaid.toFixed(2)}
                  </p>
                </div>

                {/* Share */}
                <div>
                  <p className="text-xs text-hk-text-light">
                    Share
                  </p>

                  <p className="mt-0.5 font-medium text-hk-text">
                    ₱{summary.totalOwed.toFixed(2)}
                  </p>
                </div>

                {/* Net Balance */}
                <div className="sm:text-right">
                  <p className="text-xs text-hk-text-light">
                    Balance
                  </p>

                  <p
                    className={`
                      mt-0.5
                      font-bold
                      ${
                        summary.netBalance >= 0
                          ? "text-hk-success"
                          : "text-hk-danger"
                      }
                    `}
                  >
                    {summary.netBalance >= 0
                      ? "+"
                      : "-"}
                    ₱
                    {Math.abs(
                      summary.netBalance
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Who Owes Who */}
      <div>
        <BalanceSummary
          expenses={expenses}
          members={members}
        />
      </div>

    </div>
  );
}