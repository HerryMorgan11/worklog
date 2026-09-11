import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/layaout/AppSidebar"
import { AppNavbar } from "@/components/layaout/AppNavbar"

// Placeholder user until real auth is wired up.
const user = Promise.resolve({
  name: "David",
  lastName: "Jacobo",
  email: "david.jacobo@hiberus.com",
  imageUrl: "",
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppNavbar user={user} />
        <div className="flex flex-1 flex-col p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
