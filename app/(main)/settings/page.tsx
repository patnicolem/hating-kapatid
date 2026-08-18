import SettingsForm from "@/components/SettingsForm";
import { requireUser } from "@/lib/queries";

export default async function SettingsPage() {
  const user = await requireUser();

  return <SettingsForm initialUser={user} />;
}
