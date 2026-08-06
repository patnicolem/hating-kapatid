"use client";
import { useState } from "react";
import GroupCard from "@/components/GroupCard";
import Sidebar from "@/components/Sidebar";


export default function Home() {

      
    const [groups, setGroups] = useState([
      { name: "Thailand 2027" },
      { name: "Apartment Expenses" },
      { name: "Weekend Gala"}
    ])

    const [newGroupName, setNewGroupName] = useState("");

    const [selectedGroup, setSelectedGroup] = useState(groups[0]);

    function addGroup() {
      if (newGroupName.trim() === "") return;

      const newGroup = {
        name: newGroupName,
      };

      setGroups([...groups, newGroup]);
      setSelectedGroup(newGroup);
      setNewGroupName("");
    }


  return (
    <main className="flex flex-1 justify-center p-8">

      <div className="flex w-full max-w-7xl gap-8">

        {/*Left Panel */}

        <div className="w-80 h-[75vh] flex flex-col">

          <Sidebar
              groups={groups}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
          />


          <div
              className="
                  mt-auto
                  pt-6
                  space-y-4
              "
          >

            <input
                type="text"
                placeholder="New Expense Group"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter"){
                    addGroup();
                  }
                }}
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
                onClick={addGroup}
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
                  Create Group
              </button>
          </div>


        </div>



        {/*Right Panel */}

        <div
            className="
                flex-1
                bg-white
                rounded-xl
                shadow-sm
                p-8
                h-[75vh]
                overflow-y-auto
            "
        >

          <div
              className="
                  bg-white
                  rounded-xl
                  shadow-sm
                  p-8
                  h-full
                  overflow-y-auto
              "
          >
            <h2 className="text-3xl font-bold">
              {selectedGroup.name}
            </h2>
          </div>

        </div>


      </div>

    </main>
  );
}
