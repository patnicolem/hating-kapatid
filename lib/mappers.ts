import type { Prisma } from "@/lib/generated/prisma/client";
import type { GroupRole } from "@/lib/generated/prisma/client";
import type {
  GroupGetPayload,
  GroupInclude,
} from "@/lib/generated/prisma/models/Group";
import type { Expense, Group, Member } from "@/types/group";

export const groupInclude = {
  members: {
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  },
  expenses: {
    include: { splits: true },
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

export function toGroup(group: GroupWithData): Group {
  return {
    id: group.id,
    name: group.name,
    currency: group.currency,
    members: group.members.map(toMember),
    expenses: group.expenses.map(toExpense),
  };
}