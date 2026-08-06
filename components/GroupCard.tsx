type GroupCardProps = {
  name: string;
  onClick: () => void;
};

export default function GroupCard({
  name,
  onClick,
}: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#b2e0d4] rounded-xl shadow-sm"
    >
      <h2 className="text-2xl font-bold">{name}</h2>
    </div>
  );
}