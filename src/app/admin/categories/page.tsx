import { requirePermission } from "@/lib/dal";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import { listCourseCategories } from "@/app/actions/categories";
import { PageHeader } from "@/components/PageHeader";
import { CategoriesListClient } from "@/components/CategoriesListClient";

export default async function AdminCategoriesPage() {
  const admin = await requirePermission("categories:view");
  const [categories, permissions] = await Promise.all([
    listCourseCategories(),
    getUserPermissionKeys(admin.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle={`${categories.length} categories`} />
      <CategoriesListClient
        categories={categories}
        canCreate={permissions.has("categories:create")}
        canEdit={permissions.has("categories:edit")}
        canDelete={permissions.has("categories:delete")}
      />
    </div>
  );
}
