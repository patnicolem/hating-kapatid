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

export type Group = {
  id: string;
  name: string;
  currency: string;
  members: Member[];
  expenses: Expense[];
};