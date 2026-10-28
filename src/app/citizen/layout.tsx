import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/layers/api/auth-session";
import { AppShell } from "@/components/layout/AppShell";

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "CITIZEN") {
    redirect("/sign-in");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
