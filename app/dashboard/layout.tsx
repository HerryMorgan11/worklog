import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CurrentUserProvider } from "@/components/providers/current-user-provider"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layaout/AppSidebar"
import { AppNavbar } from "@/components/layaout/AppNavbar"
import { getOrCreateCurrentUser } from "@/server/services/create-user-service"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getOrCreateCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const profile = {
    name: user.name ?? "Usuario",
    email: user.email ?? "",
    imageUrl: user.avatarUrl ?? "",
  }

  return (
    <CurrentUserProvider userId={user.id}>
      <SidebarProvider>
        <AppSidebar user={Promise.resolve(profile)} />
        <SidebarInset>
          <AppNavbar user={Promise.resolve(profile)} />
          <div className="flex flex-1 flex-col p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  )
}
