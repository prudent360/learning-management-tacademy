import { requirePermission } from "@/lib/dal";
import { listAdminRoles } from "@/app/actions/roles";
import { RolesPermissionsView } from "@/components/RolesPermissionsView";

export default async function AdminRolesPage() {
  await requirePermission("roles:view");
  const roles = await listAdminRoles();
  return <RolesPermissionsView initialRoles={roles} />;
}
