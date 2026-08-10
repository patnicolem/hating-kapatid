type UserCardProps = {
  name: string;
  balance: number;
};

export default function UserCard({
  name,
  balance,
}: UserCardProps) {
  const isPositive = balance > 0;
  const isNegative = balance < 0;

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-hk-border
        bg-hk-surface
        px-4
        py-4
        transition-colors
        hover:border-hk-primary
      "
    >
      {/* User */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-hk-accent
            text-hk-primary
          "
        >
          👤
        </div>

        {/* User information */}
        <div>
          <h2 className="font-semibold text-hk-text">
            {name}
          </h2>

          <p className="text-sm text-hk-text-light">
            Group member
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="text-right">
        <p className="text-xs text-hk-text-light">
          Balance
        </p>

        <p
          className={`
            mt-0.5
            font-bold
            ${
              isPositive
                ? "text-hk-success"
                : isNegative
                  ? "text-hk-danger"
                  : "text-hk-text-light"
            }
          `}
        >
          {balance > 0 ? "+" : ""}
          ₱{balance.toFixed(2)}
        </p>
      </div>
    </div>
  );
}