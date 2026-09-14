"use client"

import * as React from "react"
import { use } from "react"
import { useClerk } from "@clerk/nextjs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { LogOut, Moon, Sun } from "lucide-react"

type User = {
  name: string
  email: string
  imageUrl: string
}

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  // Read the current theme on mount (after hydration to avoid mismatch).
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground [&_svg]:size-4"
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

export function AppNavbar({ user }: { user: Promise<User> }) {
  const { name, email, imageUrl } = use(user)
  const { signOut } = useClerk()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Worklog</span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center rounded-full transition-all outline-none select-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="User menu"
          >
            <Avatar className="size-7">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className="text-[10px]">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56">
            <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={imageUrl} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
            </div>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void signOut({ redirectUrl: "/sign-in" })}
            >
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
