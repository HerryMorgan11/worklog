import "server-only"

export interface RedmineIssue {
  id: number
  project: { id: number; name: string }
  tracker: { id: number; name: string }
  status: { id: number; name: string }
  priority: { id: number; name: string }
  author: { id: number; name: string }
  subject: string
  description: string
  doneRatio: number
  estimatedHours: number | null
  createdOn: string
  updatedOn: string
}

type RedmineIssuesResponse = {
  issues?: Array<{
    id: number
    project: { id: number; name: string }
    tracker: { id: number; name: string }
    status: { id: number; name: string }
    priority: { id: number; name: string }
    author: { id: number; name: string }
    subject: string
    description?: string | null
    done_ratio: number
    estimated_hours?: number | null
    created_on: string
    updated_on: string
  }>
  total_count?: number
}

const REDMINE_ISSUES_URL = "https://redmine.hiberus.com/redmine/issues.json"
const PAGE_SIZE = 100

export async function getIssuesRedmine(projectId: number): Promise<RedmineIssue[]> {
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new Error("El identificador del proyecto no es válido.")
  }

  const apiKey = process.env.REDMINE_API_KEY
  if (!apiKey) throw new Error("REDMINE_API_KEY no está configurada.")

  const issues: RedmineIssue[] = []
  let offset = 0
  let totalCount = Infinity

  while (offset < totalCount) {
    const url = new URL(REDMINE_ISSUES_URL)
    url.searchParams.set("project_id", String(projectId))
    url.searchParams.set("limit", String(PAGE_SIZE))
    url.searchParams.set("offset", String(offset))

    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Redmine-API-Key": apiKey },
      cache: "no-store",
    })
    if (!response.ok) throw new Error("No se han podido cargar las issues de Redmine.")

    const data = (await response.json()) as RedmineIssuesResponse
    const page = data.issues ?? []
    issues.push(...page.map((issue) => ({
      id: issue.id,
      project: issue.project,
      tracker: issue.tracker,
      status: issue.status,
      priority: issue.priority,
      author: issue.author,
      subject: issue.subject,
      description: issue.description ?? "",
      doneRatio: issue.done_ratio,
      estimatedHours: issue.estimated_hours ?? null,
      createdOn: issue.created_on,
      updatedOn: issue.updated_on,
    })))

    totalCount = data.total_count ?? issues.length
    if (page.length === 0) break
    offset += page.length
  }

  return issues
}
