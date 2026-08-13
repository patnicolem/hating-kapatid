"use client";

import { Expense, Member } from "@/types/group";
import { computeMemberNetBalance, formatAmount } from "@/lib/balances";

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
  const balances: Balance[] = members.map((member) => ({
    memberId: member.id,
    amount: computeMemberNetBalance(expenses, member.id),
  }));

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
                {formatAmount(debt.amount, currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}