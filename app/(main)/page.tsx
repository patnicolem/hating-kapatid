import { Suspense } from "react";
import DashboardClient from "@/components/DashboardClient";
import { requireUser, getGroups, getInvitations, getFriendsData } from "@/lib/queries";

async function DashboardContent() {
  const user = await requireUser();

  const [groups, invitations, friendsData] = await Promise.all([
    getGroups(user.id),
    getInvitations(user.id),
    getFriendsData(user.id),
  ]);

  return (
    <DashboardClient
      user={user}
      groups={groups}
      invitations={invitations}
      friendRequests={friendsData.incoming}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-75 items-center justify-center">
          <p className="text-hk-text-light">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
