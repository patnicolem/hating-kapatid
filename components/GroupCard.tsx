type GroupCardProps = {
  name: string;
  onClick: () => void;
};

export default function GroupCard({
  name,
  onClick,
}: GroupCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        rounded-xl
        border
        border-hk-border
        bg-hk-surface
        px-5
        py-4
        text-left
        transition-all
        hover:border-hk-accent
        hover:shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-hk-accent
        focus:ring-offset-2
        focus:ring-offset-hk-background
      "
    >
      <h2 className="text-lg font-semibold text-hk-text">
        {name}
      </h2>

      <p className="mt-1 text-sm text-hk-text-light">
        View group expenses
      </p>
    </button>
  );
}