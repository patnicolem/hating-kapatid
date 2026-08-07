"use client";

import { useState } from "react";
import { Member } from "@/types/group";

type AddMemberFormProps = {
  onAddMember: (member: Member) => void;
};

export default function AddMemberForm({
  onAddMember,
}: AddMemberFormProps) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit() {

    if (name.trim() === "" || email.trim() === "") {
      return;
    }

    const newMember: Member = {
      id: Date.now(),
      name: name,
      email: email,
    };

    onAddMember(newMember);

    setName("");
    setEmail("");
  }

  return (
    <div className="space-y-2 max-w-md">

      <input
        type="text"
        placeholder="Member Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="
          w-full
          bg-white
          border
          border-hk-accent
          rounded-lg
          px-4
          py-2
          focus:outline-none
          focus:ring-2
          focus:ring-hk-secondary
        "
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="
          w-full
          bg-white
          border
          border-hk-accent
          rounded-lg
          px-4
          py-2
          focus:outline-none
          focus:ring-2
          focus:ring-hk-secondary
        "
      />

      <button
        onClick={handleSubmit}
        className="
          w-full
          bg-hk-secondary
          hover:bg-hk-primary
          text-white
          rounded-lg
          py-2
          transition-colors
        "
      >
        Add Member
      </button>

    </div>
  );
}