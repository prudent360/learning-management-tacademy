import { requireAdmin } from "@/lib/dal";
import { listEmailTemplates } from "@/app/actions/settings";
import { EmailTemplatesListClient } from "@/components/settings/EmailTemplatesListClient";

export default async function EmailTemplatesPage() {
  await requireAdmin(); // defense in depth, independent of the layout's own check
  const templates = await listEmailTemplates();
  return <EmailTemplatesListClient templates={templates} />;
}
