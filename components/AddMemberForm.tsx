"use client";

import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
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
      name: name.trim(),
      email: email.trim(),
    };

    onAddMember(newMember);

    setName("");
    setEmail("");
  }

  return (
    <div className="max-w-2xl">

      {/* Inputs */}
      <div className="flex items-center gap-3">

        {/* Member Name */}
        <input
          type="text"
          placeholder="Member Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            flex-1
            bg-white
            border
            border-hk-accent
            rounded-lg
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-hk-secondary
          "
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            flex-1
            bg-white
            border
            border-hk-accent
            rounded-lg
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-hk-secondary
          "
        />

      </div>

      {/* Add Member Button */}
      <div className="flex justify-center mt-3">

        <button
          type="button"
          onClick={handleSubmit}
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-hk-secondary
            hover:bg-hk-primary
            text-white
            rounded-lg
            px-6
            py-2
            transition-colors
          "
        >
          <UserRoundPlus size={18} />
          Add Member
        </button>

      </div>

    </div>
  );
}