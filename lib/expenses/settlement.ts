import type { Expense, Member } from "@/types/group";

export type SettlementRecord = {
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

export type SuggestedSettlement = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

const ROUND_THRESHOLD = 0.005;

function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeMemberNetBalances(
  expenses: Expense[],
  members: Member[],
  settlements: SettlementRecord[] = []
): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const member of members) {
    balances[member.id] = 0;
  }

  for (const expense of expenses) {
    if (expense.paidBy in balances) {
      balances[expense.paidBy] += expense.amount;
    }

    for (const split of expense.splits) {
      if (!(split.memberId in balances)) continue;

      const owed =
        expense.splitType === "PERCENT"
          ? expense.amount * (split.value / 100)
          : split.value;

      balances[split.memberId] -= owed;
    }
  }

  for (const settlement of settlements) {
    if (
      settlement.status !== "PENDING" &&
      settlement.status !== "COMPLETED"
    ) {
      continue;
    }

    if (settlement.fromUserId in balances) {
      balances[settlement.fromUserId] += settlement.amount;
    }

    if (settlement.toUserId in balances) {
      balances[settlement.toUserId] -= settlement.amount;
    }
  }

  return balances;
}

export function computeSuggestedSettlements(
  expenses: Expense[],
  members: Member[],
  settlements: SettlementRecord[]
): SuggestedSettlement[] {
  const balances = computeMemberNetBalances(
    expenses,
    members,
    settlements
  );

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > ROUND_THRESHOLD)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([userId, balance]) => ({ userId, balance }));

  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < -ROUND_THRESHOLD)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([userId, balance]) => ({ userId, balance: -balance }));

  const suggestions: SuggestedSettlement[] = [];
  let creditIndex = 0;

  for (const debtor of debtors) {
    let remaining = debtor.balance;

    while (
      remaining > ROUND_THRESHOLD &&
      creditIndex < creditors.length
    ) {
      const creditor = creditors[creditIndex];
      const payment = Math.min(remaining, creditor.balance);

      suggestions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: roundCents(payment),
      });

      remaining -= payment;
      creditor.balance -= payment;

      if (creditor.balance <= ROUND_THRESHOLD) {
        creditIndex += 1;
      }
    }
  }

  return suggestions;
}
