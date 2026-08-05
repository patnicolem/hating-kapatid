type UserCardProps = {
    name: string;
    balance: number;
};

export default function UserCard({ name, balance }: UserCardProps) {
    return (
        <div>
            <h2>👤 {name}</h2>
            <p>Balance: ₱{balance}</p>
        </div>
    )
}