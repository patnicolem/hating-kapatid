"use client";

import { useState } from "react";
import { Bell, HandCoins, Loader2 } from "lucide-react";
import type { Member, Settlement, SuggestedSettlement } from "@/types/group";
import { formatAmount } from "@/lib/balances";

type SettlementSectionProps = {
  members: Member[];
  settlements: Settlement[];
  suggestedSettlements: SuggestedSettlement[];
  currentUserId: string | null;
  currency: string;
  onCreate: (fromUserId: string, toUserId: string, amount: number) => void;
  onComplete: (settlementId: string) => void;
  onCancel: (settlementId: string) => void;
  onNotify: (settlementId: string) => Promise<void>;
};

const pendingSettlements = (settlements: Settlement[]) =>
  settlements.filter((settlement) => settlement.status === "PENDING");

const historySettlements = (settlements: Settlement[]) =>
  settlements.filter(
    (settlement) =>
      settlement.status === "COMPLETED" ||
      settlement.status === "CANCELLED"
  );

export default function SettlementSection({
  members,
  settlements,
  suggestedSettlements,
  currentUserId,
  currency,
  onCreate,
  onComplete,
  onCancel,
  onNotify,
}: SettlementSectionProps) {
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const memberName = (userId: string) =>
    members.find((member) => member.id === userId)?.name ?? "Unknown";

  const canAct = (fromUserId: string, toUserId: string) =>
    currentUserId !== null &&
    (currentUserId === fromUserId || currentUserId === toUserId);

  const pending = pendingSettlements(settlements);
  const history = historySettlements(settlements);

  const buttonClass = `
    rounded-lg
    px-3
    py-1.5
    text-xs
    font-medium
    transition-colors
  `;

  async function handleNotify(settlementId: string) {
    setNotifyingId(settlementId);

    try {
      await onNotify(settlementId);
    } finally {
      setNotifyingId(null);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2">
        <HandCoins size={20} className="text-hk-primary" />
        <h3 className="text-xl font-bold text-hk-primary">Settlements</h3>
      </div>

      <p className="mt-1 text-sm text-hk-text-light sm:text-base">
        Who owes who, and payments that have been settled.
      </p>

      {/* Outstanding balances */}
      <div className="mt-5 space-y-2">
        {suggestedSettlements.length === 0 && pending.length === 0 ? (
          <div
            className="
              rounded-xl
              border
              border-hk-border
              bg-hk-surface
              px-5
              py-4
            "
          >
            <p className="text-sm text-hk-text-light">
              All settled up — nobody owes anything.
            </p>
          </div>
        ) : (
          <>
            {suggestedSettlements.map((suggestion, index) => {
              const isParty = canAct(
                suggestion.fromUserId,
                suggestion.toUserId
              );

              return (
                <div
                  key={`${suggestion.fromUserId}-${suggestion.toUserId}-${index}`}
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-hk-border
                    bg-hk-surface
                    px-5
                    py-3
                  "
                >
                  <p className="text-sm text-hk-text">
                    <span className="font-semibold">
                      {memberName(suggestion.fromUserId)}
                    </span>{" "}
                    owes{" "}
                    <span className="font-semibold">
                      {memberName(suggestion.toUserId)}
                    </span>{" "}
                    <span className="font-bold text-hk-text">
                      {formatAmount(suggestion.amount, currency)}
                    </span>
                  </p>

                  {isParty && (
                    <button
                      type="button"
                      onClick={() =>
                        onCreate(
                          suggestion.fromUserId,
                          suggestion.toUserId,
                          suggestion.amount
                        )
                      }
                      className={`${buttonClass} bg-hk-primary text-white hover:bg-hk-primary-hover`}
                    >
                      Settle up
                    </button>
                  )}
                </div>
              );
            })}

            {/* Pending confirmations */}
            {pending.map((settlement) => {
              const isParty = canAct(
                settlement.fromUserId,
                settlement.toUserId
              );

              return (
                <div
                  key={settlement.id}
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-hk-border
                    bg-hk-surface
                    px-5
                    py-3
                  "
                >
                  <div>
                    <p className="text-sm text-hk-text">
                      <span className="font-semibold">
                        {settlement.fromName}
                      </span>{" "}
                      →{" "}
                      <span className="font-semibold">
                        {settlement.toName}
                      </span>{" "}
                      <span className="font-bold text-hk-text">
                        {formatAmount(settlement.amount, currency)}
                      </span>
                    </p>

                    <p className="mt-0.5 text-xs text-hk-text-light">
                      Awaiting confirmation
                    </p>
                  </div>

                  {isParty && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onComplete(settlement.id)}
                        className={`${buttonClass} bg-hk-success text-white hover:opacity-90`}
                      >
                        Mark as paid
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNotify(settlement.id)}
                        disabled={notifyingId === settlement.id}
                        className={`${buttonClass} flex items-center gap-1.5 border border-hk-border bg-hk-surface text-hk-text-secondary hover:border-hk-primary hover:text-hk-primary disabled:opacity-60`}
                      >
                        {notifyingId === settlement.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Bell size={14} />
                        )}
                        Notify
                      </button>

                      <button
                        type="button"
                        onClick={() => onCancel(settlement.id)}
                        className={`${buttonClass} border border-hk-border bg-hk-surface text-hk-text-secondary hover:text-hk-danger`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-hk-text-secondary">
            History
          </h4>

          <div className="mt-2 space-y-2">
            {history.map((settlement) => {
              const isCompleted = settlement.status === "COMPLETED";

              return (
                <div
                  key={settlement.id}
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-hk-border
                    bg-hk-surface
                    px-5
                    py-3
                  "
                >
                  <p className="text-sm text-hk-text">
                    <span className="font-semibold">
                      {settlement.fromName}
                    </span>{" "}
                    paid{" "}
                    <span className="font-semibold">
                      {settlement.toName}
                    </span>{" "}
                    <span className="font-bold text-hk-text">
                      {formatAmount(settlement.amount, currency)}
                    </span>
                  </p>

                  <span
                    className={`
                      rounded-md
                      px-2
                      py-0.5
                      text-xs
                      font-medium
                      ${
                        isCompleted
                          ? "bg-hk-success/10 text-hk-success"
                          : "bg-hk-surface-secondary text-hk-text-light"
                      }
                    `}
                  >
                    {isCompleted ? "Completed" : "Cancelled"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
