"use client";

import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import { Member } from "@/types/group";

type AddMemberFormProps = {
  onAddMember: (member: Omit<Member, "id">) => void;
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

    const newMember: Omit<Member, "id"> = {
      name: name.trim(),
      email: email.trim(),
    };

    onAddMember(newMember);

    setName("");
    setEmail("");
  }

  const inputClass = `
    w-full
    rounded-lg
    border
    border-hk-border
    bg-hk-surface
    px-3
    py-2.5
    text-hk-text
    placeholder:text-hk-text-muted
    transition-colors
    focus:border-hk-primary
    focus:outline-none
    focus:ring-2
    focus:ring-hk-primary/20
  `;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Member Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-hk-primary
            px-6
            py-2.5
            font-medium
            text-white
            transition-colors
            hover:bg-hk-primary-hover
            focus:outline-none
            focus:ring-2
            focus:ring-hk-primary
            focus:ring-offset-2
            focus:ring-offset-hk-bg
          "
        >
          <UserRoundPlus size={18} />
          Add Member
        </button>
      </div>
    </div>
  );
}