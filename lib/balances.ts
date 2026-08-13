import type { Expense } from "@/types/group";

export function computeMemberNetBalance(
  expenses: Expense[],
  memberId: string
): number {
  let balance = 0;

  for (const expense of expenses) {
    if (expense.paidBy === memberId) {
      balance += expense.amount;
    }

    const split = expense.splits.find(
      (split) => split.memberId === memberId
    );

    if (split) {
      const owedAmount =
        expense.splitType === "PERCENT"
          ? expense.amount * (split.value / 100)
          : split.value;

      balance -= owedAmount;
    }
  }

  return balance;
}

export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}