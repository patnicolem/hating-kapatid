export type Member = {
  id: number;
  name: string;
  email: string;
};

export type ExpenseSplit = {
  memberId: number;
  value: number;
};

export type Expense = {
  id: number;
  description: string;
  amount: number;
  paidBy: number;
  splitType: "even" | "amount" | "percent";
  splits: {
    memberId: number;
    value: number;
  }[];
};

export type Group = {
  id: number;
  name: string;
  members: Member[];
  expenses: Expense[];
};