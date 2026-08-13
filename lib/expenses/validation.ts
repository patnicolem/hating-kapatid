export type SplitType = "EQUAL" | "AMOUNT" | "PERCENT";

export type ExpenseInput = {
  description?: string;
  amount?: number;
  paidBy?: string;
  splitType?: string;
  splits?: { memberId?: string; value?: number }[];
};

export type ValidatedSplit = {
  userId: string;
  value: number;
};

export type ValidationResult =
  | { ok: true; splitType: SplitType; splitValues: ValidatedSplit[] }
  | { ok: false; error: string };

function toCents(value: number): number {
  return Math.round(value * 100);
}

export function validateExpense(
  input: ExpenseInput,
  memberIds: Set<string>
): ValidationResult {
  const description = input.description?.trim();
  const rawAmount = Number(input.amount);
  const amount = Math.round(rawAmount * 100) / 100;
  const paidBy = input.paidBy;
  const splitType = input.splitType;
  const splits = Array.isArray(input.splits) ? input.splits : [];

  if (!description) {
    return { ok: false, error: "Description is required" };
  }

  if (!Number.isFinite(rawAmount) || amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero" };
  }

  if (!paidBy || !memberIds.has(paidBy)) {
    return { ok: false, error: "Payer must be a group member" };
  }

  if (
    splitType !== "EQUAL" &&
    splitType !== "AMOUNT" &&
    splitType !== "PERCENT"
  ) {
    return { ok: false, error: "Invalid split type" };
  }

  const splitMemberIds = splits.map((split) => split.memberId as string);

  if (splitMemberIds.length === 0) {
    return {
      ok: false,
      error: "At least one member must be included in the split",
    };
  }

  if (new Set(splitMemberIds).size !== splitMemberIds.length) {
    return { ok: false, error: "Split contains duplicate members" };
  }

  for (const memberId of splitMemberIds) {
    if (!memberIds.has(memberId)) {
      return {
        ok: false,
        error: "Split includes a member not in this group",
      };
    }
  }

  let splitValues: ValidatedSplit[];

  if (splitType === "EQUAL") {
    const count = splitMemberIds.length;
    const amountCents = toCents(amount);
    const baseShareCents = Math.floor(amountCents / count);
    const remainderCents = amountCents - baseShareCents * count;

    splitValues = splitMemberIds.map((memberId, index) => ({
      userId: memberId,
      value:
        (index === count - 1
          ? baseShareCents + remainderCents
          : baseShareCents) / 100,
    }));
  } else if (splitType === "AMOUNT") {
    const amountCents = toCents(amount);
    let totalCents = 0;

    for (const split of splits) {
      const value = Math.round(Number(split.value) * 100) / 100;

      if (!Number.isFinite(value) || value < 0 || value > amount) {
        return {
          ok: false,
          error: "Split amounts must be between 0 and the expense amount",
        };
      }

      totalCents += toCents(value);
    }

    if (totalCents !== amountCents) {
      return {
        ok: false,
        error: "Split amounts must equal the expense amount",
      };
    }

    splitValues = splits.map((split) => ({
      userId: split.memberId as string,
      value: Math.round(Number(split.value) * 100) / 100,
    }));
  } else {
    let totalPercentCents = 0;

    for (const split of splits) {
      const value = Math.round(Number(split.value) * 100) / 100;

      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return {
          ok: false,
          error: "Percentages must be between 0 and 100",
        };
      }

      totalPercentCents += toCents(value);
    }

    if (Math.abs(totalPercentCents - 10000) > 1) {
      return { ok: false, error: "Percentages must add up to 100%" };
    }

    splitValues = splits.map((split) => ({
      userId: split.memberId as string,
      value: Math.round(Number(split.value) * 100) / 100,
    }));
  }

  return { ok: true, splitType, splitValues };
}