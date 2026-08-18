import FriendsClient from "@/components/FriendsClient";
import { requireUser, getFriendsData } from "@/lib/queries";

export default async function FriendsPage() {
  const user = await requireUser();
  const { friends, incoming, outgoing } = await getFriendsData(user.id);

  return (
    <FriendsClient
      initialFriends={friends}
      initialIncoming={incoming}
      initialOutgoing={outgoing}
    />
  );
}
