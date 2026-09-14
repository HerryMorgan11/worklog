import "server-only"

export interface Project {
  id: number
  name: string
  description: string
}

type RedmineProjectsResponse = {
  projects?: Array<{ id: number; name: string; description?: string | null }>
  total_count?: number
}

const REDMINE_PROJECTS_URL = "https://redmine.hiberus.com/redmine/projects.json"
const PAGE_SIZE = 100

export async function getProjectsRedmine(): Promise<Project[]> {
  const apiKey = process.env.REDMINE_API_KEY
  if (!apiKey) throw new Error("REDMINE_API_KEY no está configurada.")

  const projects: Project[] = []
  let offset = 0
  let totalCount = Infinity

  while (offset < totalCount) {
    const url = new URL(REDMINE_PROJECTS_URL)
    url.searchParams.set("limit", String(PAGE_SIZE))
    url.searchParams.set("offset", String(offset))

    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Redmine-API-Key": apiKey },
      cache: "no-store",
    })
    if (!response.ok) throw new Error("No se han podido cargar los proyectos de Redmine.")

    const data = (await response.json()) as RedmineProjectsResponse
    const page = data.projects ?? []
    projects.push(...page.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description ?? "",
    })))

    totalCount = data.total_count ?? projects.length
    if (page.length === 0) break
    offset += page.length
  }

  return projects
}
