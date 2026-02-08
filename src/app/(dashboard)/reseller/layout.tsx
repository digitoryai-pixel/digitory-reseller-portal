import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as unknown as { role?: string })?.role;

  if (role !== "RESELLER") {
    redirect("/admin");
  }

  return <>{children}</>;
}
