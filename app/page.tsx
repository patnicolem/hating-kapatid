import UserCard from "@/components/UserCard";

const users = [
  {
    name: "Pat",
    balance: 500,
  },
  {
    name: "Alex",
    balance: -250,
  },
  {
    name: "Carla",
    balance: 0,
  },
];



export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-5xl font-bold">
        Hating Kapatid 💸
      </h1>

      <p className="text-gray-500">
        Ambangan Made Easy.
      </p>

      {users.map((user) => (
        <UserCard
          key={user.name}
          name={user.name}
          balance={user.balance}
        />
      ))}

    </main>
  );
}
