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

        if (expense.splitType === "percent") {
          return total + (
            expense.amount * split.value / 100
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
    <div>

        <h3 className="text-xl font-bold text-hk-primary mb-4">
        Expense Summary
        </h3>

        {/* Total Expenses */}

        <div className="bg-hk-light rounded-lg p-4 mb-6">

        <p className="text-sm text-hk-text-light">
            Total Group Expenses
        </p>

        <p className="text-2xl font-bold text-hk-primary">
            ₱{totalExpenses.toFixed(2)}
        </p>

        </div>


        {/* Individual Summary */}

        <div className="border border-hk-accent rounded-lg overflow-hidden">

        {memberSummaries.map((summary) => (

            <div
            key={summary.member.id}
            className="
                grid
                grid-cols-4
                items-center
                gap-4
                px-4
                py-3
                border-b
                border-hk-accent
                last:border-b-0
                bg-white
            "
            >

            {/* Member */}
            <div className="font-semibold text-hk-primary">
                {summary.member.name}
            </div>

            {/* Paid */}
            <div>
                <span className="text-sm text-hk-text-light">
                Paid:
                </span>{" "}
                <span className="font-medium">
                ₱{summary.totalPaid.toFixed(2)}
                </span>
            </div>

            {/* Share */}
            <div>
                <span className="text-sm text-hk-text-light">
                Share:
                </span>{" "}
                <span className="font-medium">
                ₱{summary.totalOwed.toFixed(2)}
                </span>
            </div>

            {/* Net Balance */}
            <div
                className={`text-right font-bold ${
                summary.netBalance >= 0
                    ? "text-green-700"
                    : "text-red-600"
                }`}
            >
                {summary.netBalance >= 0 ? "+" : "-"}
                ₱{Math.abs(summary.netBalance).toFixed(2)}
            </div>

            </div>

        ))}

        </div>


        {/* Who Owes Who */}

        <div className="mt-8">

        <BalanceSummary
            expenses={expenses}
            members={members}
        />

        </div>

    </div>
    );
}