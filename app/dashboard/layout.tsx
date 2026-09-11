import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CurrentUserProvider } from "@/components/providers/current-user-provider"

import { AppSidebar } from "@/components/layaout/AppSidebar"
import { AppNavbar } from "@/components/layaout/AppNavbar"

const temporaryUser = {
  name: "David",
  lastName: "Jacobo",
  email: "david.jacobo@hiberus.com",
  imageUrl: "",
}

async function getCurrentUser() {
  return {
    ...temporaryUser,
    // Temporal hasta integrar la autenticación. No consulta la tabla users.
    id: process.env.DEV_USER_ID ?? null,
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <CurrentUserProvider userId={user.id}>
      <SidebarProvider>
        <AppSidebar user={Promise.resolve(user)} />
        <SidebarInset>
          <AppNavbar user={Promise.resolve(user)} />
          <div className="flex flex-1 flex-col p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  )
}
