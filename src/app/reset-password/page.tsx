import { ResetPasswordForm } from "@/components/ResetPasswordForm";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
