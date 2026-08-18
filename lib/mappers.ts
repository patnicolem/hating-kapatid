import type { Prisma } from "@/lib/generated/prisma/client";
import type { GroupRole } from "@/lib/generated/prisma/client";
import type {
  GroupGetPayload,
  GroupInclude,
} from "@/lib/generated/prisma/models/Group";
import type { Expense, Group, Member, Settlement } from "@/types/group";
import { computeSuggestedSettlements } from "@/lib/expenses/settlement";

export const groupInclude = {
  members: {
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  },
  expenses: {
    include: { splits: true },
    orderBy: { createdAt: "desc" },
  },
  settlements: {
    include: {
      fromUser: { select: { id: true, username: true } },
      toUser: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies GroupInclude;

type GroupWithData = GroupGetPayload<{ include: typeof groupInclude }>;

type MemberRow = {
  user: { id: string; username: string; email: string };
  role: GroupRole;
};

type AmountValue = Prisma.Decimal | number | string;

type SplitRow = { userId: string; value: AmountValue };

type ExpenseRow = {
  id: string;
  paidBy: string;
  description: string;
  amount: AmountValue;
  splitType: Expense["splitType"];
  splits: SplitRow[];
};

type SettlementRow = {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: AmountValue;
  status: Settlement["status"];
  settledAt: Date | null;
  createdAt: Date;
  fromUser: { id: string; username: string };
  toUser: { id: string; username: string };
};

export function toMember(groupMember: MemberRow): Member {
  return {
    id: groupMember.user.id,
    name: groupMember.user.username,
    email: groupMember.user.email,
    role: groupMember.role,
  };
}

export function toExpense(expense: ExpenseRow): Expense {
  return {
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount),
    paidBy: expense.paidBy,
    splitType: expense.splitType,
    splits: expense.splits.map((split) => ({
      memberId: split.userId,
      value: Number(split.value),
    })),
  };
}

export function toSettlement(settlement: SettlementRow): Settlement {
  return {
    id: settlement.id,
    fromUserId: settlement.fromUserId,
    toUserId: settlement.toUserId,
    fromName: settlement.fromUser.username,
    toName: settlement.toUser.username,
    amount: Number(settlement.amount),
    status: settlement.status,
    settledAt: settlement.settledAt?.toISOString() ?? null,
    createdAt: settlement.createdAt.toISOString(),
  };
}

export function toGroup(group: GroupWithData): Group {
  const members = group.members.map(toMember);
  const expenses = group.expenses.map(toExpense);

  return {
    id: group.id,
    name: group.name,
    currency: group.currency,
    members,
    expenses,
    settlements: group.settlements.map(toSettlement),
    suggestedSettlements: computeSuggestedSettlements(
      expenses,
      members,
      group.settlements.map((settlement) => ({
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        amount: Number(settlement.amount),
        status: settlement.status,
      }))
    ),
  };
}