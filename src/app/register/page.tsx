import { RegisterForm } from "@/components/RegisterForm";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return <RegisterForm />;
}
