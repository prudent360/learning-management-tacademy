import { ProfileView } from "@/components/ProfileView";
import { getProfile } from "@/app/actions/profile";

export default async function ProfilePage() {
  const initial = await getProfile();
  return <ProfileView initial={initial} />;
}
