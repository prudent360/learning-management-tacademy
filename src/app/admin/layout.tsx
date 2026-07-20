import { requireAdmin } from "@/lib/dal";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { Toaster } from "@/components/Toaster";
import { UserProvider } from "@/lib/user-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <UserProvider user={admin}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar admin={admin} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopBar />
          <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
        <Toaster />
      </div>
    </UserProvider>
  );
}
