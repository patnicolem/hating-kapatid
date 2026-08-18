import { Suspense } from "react";
import GroupsClient from "@/components/GroupsClient";
import { requireUser, getGroups, getFriendsData } from "@/lib/queries";

async function GroupsContent() {
  const user = await requireUser();

  const [groups, friendsData] = await Promise.all([
    getGroups(user.id),
    getFriendsData(user.id),
  ]);

  return (
    <GroupsClient
      initialGroups={groups}
      currentUser={user}
      friends={friendsData.friends}
    />
  );
}

export default function GroupsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-75 items-center justify-center">
          <p className="text-hk-text-light">Loading expense groups...</p>
        </div>
      }
    >
      <GroupsContent />
    </Suspense>
  );
}
