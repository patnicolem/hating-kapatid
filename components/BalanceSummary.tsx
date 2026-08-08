"use client";

import { Expense, Member } from "@/types/group";

type BalanceSummaryProps = {
  expenses: Expense[];
  members: Member[];
};

type Balance = {
  memberId: number;
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

        // For percentage splits,
        // convert percentage into actual amount
        if (expense.splitType === "percent") {
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
    Convert net balances into actual
    "who owes who" transactions.
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

      <h3 className="text-xl font-bold text-hk-primary mb-2">
        Who Owes Who
      </h3>

      {debts.length === 0 ? (

        <div className="border border-hk-accent rounded-lg px-4 py-3">
          <p className="text-hk-text-light">
            Everyone is settled up.
          </p>
        </div>

      ) : (

        <div className="border border-hk-accent rounded-lg overflow-hidden">

          {debts.map((debt, index) => (

            <div
              key={index}
              className={`
                flex
                items-center
                justify-between
                px-4
                py-3
                ${index !== debts.length - 1
                  ? "border-b border-hk-accent"
                  : ""}
              `}
            >

              <p>
                <span className="font-semibold text-hk-primary">
                  {debt.from.name}
                </span>

                <span className="mx-2 text-hk-text-light">
                  owes
                </span>

                <span className="font-semibold text-hk-primary">
                  {debt.to.name}
                </span>
              </p>

              <p className="font-bold text-hk-primary">
                ₱{debt.amount.toFixed(2)}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );


}