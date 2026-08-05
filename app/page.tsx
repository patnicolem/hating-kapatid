"use client";
import { useState } from "react";


export default function Home() {

    function addUser() {
      
      setUsers([
        ...users,
        {
          name: newUserName,
          balance: newUserBalance
        }
      ]);

      setNewUserName("");
      setNewUserBalance(0);

    }

    const [users, setUsers] = useState([
      { name: "Pat", balance: 500 },
      { name: "Alex", balance: -250 }
    ])

    const [newUserName, setNewUserName] = useState("");

    const [newUserBalance, setNewUserBalance] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-5xl font-bold">
        Hating Kapatid 💸
      </h1>

      <p className="text-gray-500">
        Ambangan Made Easy.
      </p>

      {users.map((user) => (
        <p key={user.name}>
          {user.name} - ₱{user.balance}
        </p>
      ))}

      <input
          type="text"
          placeholder="Enter name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          className="border rounded px-3 py-2"
      />

      <input
          type="number"
          placeholder="Enter balance"
          value={newUserBalance}
          onChange={(e) => setNewUserBalance(Number(e.target.value))}
          className="border rounded px-3 py-2"
      />

      <button
          onClick = {addUser}
          className = "bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add User
      </button>

    </main>
  );
}
