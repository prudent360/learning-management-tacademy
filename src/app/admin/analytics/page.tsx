import { requireAdmin } from "@/lib/dal";
import { getAnalyticsAction } from "@/app/actions/analytics";
import { AdminAnalyticsView } from "@/components/AdminAnalyticsView";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const data = await getAnalyticsAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        subtitle="Track student course completion rates, active enrollments, and practice exam scores."
      />
      <AdminAnalyticsView data={data} />
    </div>
  );
}
