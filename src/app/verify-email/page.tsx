import { VerifyEmailForm } from "@/components/VerifyEmailForm";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmailForm email={email ?? ""} />;
}
