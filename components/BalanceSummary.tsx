"use client";

import { Expense, Member } from "@/types/group";

type BalanceSummaryProps = {
  expenses: Expense[];
  members: Member[];
  currency: string;
};

type Balance = {
  memberId: string;
  amount: number;
};

type Debt = {
  from: Member;
  to: Member;
  amount: number;
};

export default function BalanceSummary({
  expenses,
  members,
  currency,
}: BalanceSummaryProps) {
  // Calculate each member's net balance
  const balances: Balance[] = members.map((member) => {
    let balance = 0;

    expenses.forEach((expense) => {
      // Money paid by this member
      if (expense.paidBy === member.id) {
        balance += expense.amount;
      }

      // Money owed by this member
      const split = expense.splits.find(
        (split) => split.memberId === member.id
      );

      if (split) {
        let owedAmount = split.value;

        // For percentage splits
        if (expense.splitType === "PERCENT") {
          owedAmount =
            expense.amount * (split.value / 100);
        }

        balance -= owedAmount;
      }
    });

    return {
      memberId: member.id,
      amount: balance,
    };
  });

  /*
   * Convert net balances into actual
   * "who owes who" transactions.
   */
  const debts: Debt[] = [];

  const creditors = balances
    .filter((balance) => balance.amount > 0.01)
    .map((balance) => ({
      ...balance,
      amount: balance.amount,
    }));

  const debtors = balances
    .filter((balance) => balance.amount < -0.01)
    .map((balance) => ({
      ...balance,
      amount: Math.abs(balance.amount),
    }));

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (
    creditorIndex < creditors.length &&
    debtorIndex < debtors.length
  ) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(
      creditor.amount,
      debtor.amount
    );

    const fromMember = members.find(
      (member) => member.id === debtor.memberId
    );

    const toMember = members.find(
      (member) => member.id === creditor.memberId
    );

    if (fromMember && toMember) {
      debts.push({
        from: fromMember,
        to: toMember,
        amount,
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }

    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div>
      <h3 className="mb-3 text-xl font-bold text-hk-primary">
        Who Owes Who
      </h3>

      {debts.length === 0 ? (
        <div
          className="
            rounded-xl
            border
            border-hk-border
            bg-hk-surface-secondary
            px-4
            py-4
          "
        >
          <p className="text-hk-text-secondary">
            Everyone is settled up.
          </p>
        </div>
      ) : (
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-hk-border
            bg-hk-surface
          "
        >
          {debts.map((debt, index) => (
            <div
              key={index}
              className={`
                flex
                flex-col
                gap-2
                px-4
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                ${
                  index !== debts.length - 1
                    ? "border-b border-hk-border"
                    : ""
                }
              `}
            >
              <p className="text-hk-text">
                <span className="font-semibold text-hk-primary">
                  {debt.from.name}
                </span>

                <span className="mx-2 text-hk-text-muted">
                  owes
                </span>

                <span className="font-semibold text-hk-primary">
                  {debt.to.name}
                </span>
              </p>

              <p className="font-bold text-hk-primary">
                {formatCurrency(debt.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}