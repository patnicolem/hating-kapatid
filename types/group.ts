export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
};

export type ExpenseSplit = {
  memberId: string;
  value: number;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitType: "EQUAL" | "AMOUNT" | "PERCENT";
  splits: {
    memberId: string;
    value: number;
  }[];
};

export type SettlementStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type Settlement = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  toName: string;
  amount: number;
  status: SettlementStatus;
  settledAt: string | null;
  createdAt: string;
};

export type SuggestedSettlement = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

export type Group = {
  id: string;
  name: string;
  currency: string;
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  suggestedSettlements: SuggestedSettlement[];
};