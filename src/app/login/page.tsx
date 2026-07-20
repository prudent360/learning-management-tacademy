import { LoginForm } from "@/components/LoginForm";

// Force dynamic rendering so this page is never statically cached — a stale
// cached copy would reference JS chunk filenames from an older build, which
// 404 after a redeploy and silently break the form's hydration.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
