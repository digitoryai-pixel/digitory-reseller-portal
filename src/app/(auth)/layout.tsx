import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as unknown as { role?: string })?.role;
    if (role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/reseller");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-neutral-900 to-gray-900">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
