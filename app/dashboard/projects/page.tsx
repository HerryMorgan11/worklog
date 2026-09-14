import { FolderKanban } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjectsRedmine, type Project } from "@/server/services/get-projects-redmine"

export default async function ProjectsPage() {
  let projects: Project[] = []
  let errorMessage: string | null = null

  try {
    projects = await getProjectsRedmine()
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se han podido cargar los proyectos."
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
        <p className="text-muted-foreground">Proyectos disponibles en Redmine.</p>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{errorMessage}</p>
      ) : projects.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay proyectos disponibles en Redmine.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderKanban className="size-4" />
                  </div>
                  <CardTitle className="mt-2">{project.name}</CardTitle>
                  <CardDescription>Proyecto #{project.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 min-h-[3.75rem] text-sm text-muted-foreground">
                    {project.description || "Este proyecto no tiene descripción."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
