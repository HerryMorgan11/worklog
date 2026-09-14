"use client"

import { Check, Undo2 } from "lucide-react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "../shared/data-table-features"

export type PendingTimeEntry = { id: string; taskTitle: string; projectId: number | null; projectName: string; redmineIssueId: number | null; date: string; hours: number }
export type PendingAction = "approve" | "revoke"
export type IssueOption = { id: number; subject: string }

const columnHelper = createColumnHelper<DataTableFeatures, PendingTimeEntry>()

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES").format(new Date(`${date}T00:00:00`))
}

export function createPendingHoursColumns(
  actions: Record<string, PendingAction>, onAction: (id: string, action: PendingAction) => void,
  issuesByProject: Record<number, IssueOption[]>, loadingIssues: Record<number, boolean>,
  onLoadIssues: (projectId: number) => void, onAssignIssue: (entryId: string, issueId: number) => void,
): ColumnDef<DataTableFeatures, PendingTimeEntry>[] {
  return columnHelper.columns([
    columnHelper.accessor("taskTitle", { header: "Título del recordatorio" }),
    columnHelper.accessor("projectName", { header: "Proyecto" }),
    columnHelper.display({ id: "issue", header: "Issue", cell: (info) => {
      const entry = info.row.original
      if (!entry.projectId) return <span className="text-muted-foreground">Sin proyecto asignado</span>
      const issues = issuesByProject[entry.projectId] ?? []
      const isLoading = loadingIssues[entry.projectId]
      const hasSelectedIssue = issues.some((issue) => issue.id === entry.redmineIssueId)
      return (
        <select className="h-8 min-w-52 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={entry.redmineIssueId?.toString() ?? ""} onFocus={() => onLoadIssues(entry.projectId!)} onChange={(event) => onAssignIssue(entry.id, Number(event.target.value))} disabled={isLoading} aria-label={`Issue para ${entry.taskTitle}`}>
          <option value="">{isLoading ? "Cargando issues..." : "Selecciona una issue"}</option>
          {entry.redmineIssueId && !hasSelectedIssue && <option value={entry.redmineIssueId}>Issue #{entry.redmineIssueId}</option>}
          {issues.map((issue) => <option key={issue.id} value={issue.id}>#{issue.id} · {issue.subject}</option>)}
        </select>
      )
    }}),
    columnHelper.accessor("date", { header: "Fecha", cell: (info) => formatDate(info.getValue()) }),
    columnHelper.accessor("hours", { header: "Horas realizadas", cell: (info) => `${info.getValue()} h` }),
    columnHelper.display({ id: "actions", header: "Acciones", cell: (info) => {
      const entry = info.row.original
      const action = actions[entry.id]
      if (action) return <Button disabled size="sm" variant="secondary">{action === "approve" ? <Check /> : <Undo2 />}{action === "approve" ? "Aprobada" : "Revocada"}</Button>
      return <div className="flex gap-2">{entry.redmineIssueId && <Button size="sm" onClick={() => onAction(entry.id, "approve")}>Aprobar</Button>}<Button size="sm" variant="outline" onClick={() => onAction(entry.id, "revoke")}>Revocar</Button></div>
    }}),
  ])
}
