import { requirePermission } from "@/lib/dal";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import { getOrderCurrency } from "@/app/actions/settings";
import {
  listMembershipPlansAdmin,
  listMembershipMembersAdmin,
  getMembershipStatsAdmin,
} from "@/app/actions/memberships";
import { MembershipsAdminView } from "@/components/MembershipsAdminView";

export default async function AdminMembershipsPage() {
  const admin = await requirePermission("memberships:view");

  const [plans, members, stats, permissions, orderCurrency] = await Promise.all([
    listMembershipPlansAdmin(),
    listMembershipMembersAdmin(),
    getMembershipStatsAdmin(),
    getUserPermissionKeys(admin.id),
    getOrderCurrency(),
  ]);

  return (
    <MembershipsAdminView
      initialPlans={plans}
      members={members}
      stats={stats}
      currency={orderCurrency.currency}
      canCreate={permissions.has("memberships:create")}
      canEdit={permissions.has("memberships:edit")}
      canDelete={permissions.has("memberships:delete")}
    />
  );
}
