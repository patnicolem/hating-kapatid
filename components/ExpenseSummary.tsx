"use client";

import { Expense, Member, Settlement } from "@/types/group";
import { computeMemberNetBalances } from "@/lib/expenses/settlement";
import BalanceSummary from "@/components/BalanceSummary";

type ExpenseSummaryProps = {
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  currency: string;
};

export default function ExpenseSummary({
  members,
  expenses,
  settlements,
  currency,
}: ExpenseSummaryProps) {
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const netBalances = computeMemberNetBalances(
    expenses,
    members,
    settlements
  );

  const memberSummaries = members.map((member) => {
    // How much this member actually paid
    const totalPaid = expenses
      .filter((expense) => expense.paidBy === member.id)
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

        if (expense.splitType === "PERCENT") {
          return (
            total +
            expense.amount * (split.value / 100)
          );
        }

        return total + split.value;
      },
      0
    );

    // Settlements where this member paid another member
    const settledOut = settlements
      .filter(
        (settlement) =>
          settlement.fromUserId === member.id &&
          (settlement.status === "PENDING" ||
            settlement.status === "COMPLETED")
      )
      .reduce((total, settlement) => total + settlement.amount, 0);

    // Settlements where this member received payment
    const settledIn = settlements
      .filter(
        (settlement) =>
          settlement.toUserId === member.id &&
          (settlement.status === "PENDING" ||
            settlement.status === "COMPLETED")
      )
      .reduce((total, settlement) => total + settlement.amount, 0);

    // Remaining balance after settled and pending payments
    const netBalance = netBalances[member.id] ?? 0;

    return {
      member,
      totalPaid,
      totalOwed,
      settledOut,
      settledIn,
      netBalance,
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-5">
      {/* Section title */}
      <div>
        <h3 className="text-xl font-bold text-hk-primary">
          Expense Summary
        </h3>

        <p className="mt-1 text-sm text-hk-text-light">
          Paid and Share come from expenses; Settled Out/In show payments
          made or received to settle. Balance = Paid - Share + Settled Out - Settled In.
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
          {formatCurrency(totalExpenses)}
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
          {memberSummaries.map((summary, index) => (
            <div
              key={summary.member.id}
              className={`
                grid
                grid-cols-1
                gap-3
                px-5
                py-4
                sm:grid-cols-6
                sm:items-center
                sm:gap-4
                ${
                  index !== memberSummaries.length - 1
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
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>

              {/* Share */}
              <div>
                <p className="text-xs text-hk-text-light">
                  Share
                </p>

                <p className="mt-0.5 font-medium text-hk-text">
                  {formatCurrency(summary.totalOwed)}
                </p>
              </div>

              {/* Settled Out */}
              <div>
                <p className="text-xs text-hk-text-light">
                  Settled Out
                </p>

                <p className="mt-0.5 font-medium text-hk-text">
                  {summary.settledOut > 0
                    ? formatCurrency(summary.settledOut)
                    : "—"}
                </p>
              </div>

              {/* Settled In */}
              <div>
                <p className="text-xs text-hk-text-light">
                  Settled In
                </p>

                <p className="mt-0.5 font-medium text-hk-text">
                  {summary.settledIn > 0
                    ? formatCurrency(summary.settledIn)
                    : "—"}
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
                  {summary.netBalance >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(summary.netBalance))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Who Owes Who */}
      <div>
        <BalanceSummary
          expenses={expenses}
          members={members}
          settlements={settlements}
          currency={currency}
        />
      </div>
    </div>
  );
}