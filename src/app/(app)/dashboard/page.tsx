import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const userData = {
      ...user,
      id: user.id || "",
      username: user.username || `User ${user.id}`
  };

  return <DashboardClient user={userData} />;
}
