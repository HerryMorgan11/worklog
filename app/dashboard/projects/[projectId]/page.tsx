import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getIssuesRedmine, type RedmineIssue } from "@/server/services/get-issues-redmine"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value))
}

export default async function ProjectIssuesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId: projectIdParam } = await params
  const projectId = Number(projectIdParam)
  if (!Number.isSafeInteger(projectId) || projectId <= 0) notFound()

  let issues: RedmineIssue[] = []
  let errorMessage: string | null = null
  try {
    issues = await getIssuesRedmine(projectId)
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se han podido cargar las issues."
  }

  const projectName = issues[0]?.project.name ?? `Proyecto #${projectId}`

  return (
    <section className="mx-auto w-full max-w-7xl">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/projects" />}>
        <ArrowLeft />
        Volver a proyectos
      </Button>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{projectName}</h1>
        <p className="text-muted-foreground">Issues de Redmine · Proyecto #{projectId}</p>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{errorMessage}</p>
      ) : issues.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay issues en este proyecto.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Tracker</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estimación</TableHead>
                <TableHead>Actualizada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <a className="inline-flex items-center gap-1 font-medium text-primary hover:underline" href={`https://redmine.hiberus.com/redmine/issues/${issue.id}`} target="_blank" rel="noreferrer">
                      #{issue.id}
                      <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                  <TableCell className="min-w-72 whitespace-normal">
                    <p className="font-medium">{issue.subject}</p>
                    {issue.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{issue.description}</p>}
                  </TableCell>
                  <TableCell>{issue.tracker.name}</TableCell>
                  <TableCell>{issue.status.name}</TableCell>
                  <TableCell>{issue.priority.name}</TableCell>
                  <TableCell>{issue.author.name}</TableCell>
                  <TableCell>{issue.doneRatio}%</TableCell>
                  <TableCell>{issue.estimatedHours === null ? "—" : `${issue.estimatedHours} h`}</TableCell>
                  <TableCell>{formatDate(issue.updatedOn)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
