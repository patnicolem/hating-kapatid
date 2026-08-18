import InviteClient from "@/components/InviteClient";
import {
  getCurrentUser,
  getInvitePreview,
  isMemberOfGroup,
} from "@/lib/queries";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [invite, user] = await Promise.all([
    getInvitePreview(token),
    getCurrentUser(),
  ]);

  const alreadyMember =
    invite && user
      ? await isMemberOfGroup(user.id, invite.group.id)
      : false;

  return (
    <InviteClient
      token={token}
      invite={invite}
      user={user}
      alreadyMember={alreadyMember}
    />
  );
}