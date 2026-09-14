"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTable } from "@tanstack/react-table"
import { createPendingHoursColumns, type IssueOption, type PendingAction, type PendingTimeEntry } from "./columns-pending"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { features } from "../shared/data-table-features"

type TimeEntryResponse = { id: string; title: string | null; description: string | null; date: string; hours: number; redmineIssueId: number | null; redmineProjectId: number | null }
type ProjectOption = { id: number; name: string }

export function PendingHoursDataTable() {
  const [entries, setEntries] = useState<TimeEntryResponse[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [issuesByProject, setIssuesByProject] = useState<Record<number, IssueOption[]>>({})
  const [loadingIssues, setLoadingIssues] = useState<Record<number, boolean>>({})
  const [actions, setActions] = useState<Record<string, PendingAction>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const [entriesResponse, projectsResponse] = await Promise.all([fetch("/api/time-entries?status=pending", { signal: controller.signal }), fetch("/api/redmine/projects", { signal: controller.signal })])
        if (!entriesResponse.ok || !projectsResponse.ok) throw new Error("No se han podido cargar las horas pendientes.")
        setEntries(await entriesResponse.json() as TimeEntryResponse[])
        setProjects(await projectsResponse.json() as ProjectOption[])
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") setError((loadError as Error).message)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  const data = useMemo<PendingTimeEntry[]>(() => entries.map((entry) => ({
    id: entry.id,
    taskTitle: entry.title || entry.description || "Sin título",
    projectId: entry.redmineProjectId,
    projectName: projects.find((project) => project.id === entry.redmineProjectId)?.name ?? (entry.redmineProjectId ? `Proyecto #${entry.redmineProjectId}` : "Sin proyecto asignado"),
    redmineIssueId: entry.redmineIssueId,
    date: entry.date,
    hours: entry.hours,
  })), [entries, projects])

  const loadIssues = useCallback(async (projectId: number) => {
    if (issuesByProject[projectId] || loadingIssues[projectId]) return
    setLoadingIssues((current) => ({ ...current, [projectId]: true }))
    try {
      const response = await fetch(`/api/redmine/projects/${projectId}/issues`)
      if (!response.ok) throw new Error("No se han podido cargar las issues del proyecto.")
      const issues = await response.json() as IssueOption[]
      setIssuesByProject((current) => ({ ...current, [projectId]: issues }))
    } catch (loadError) {
      setError((loadError as Error).message)
    } finally {
      setLoadingIssues((current) => ({ ...current, [projectId]: false }))
    }
  }, [issuesByProject, loadingIssues])

  const assignIssue = useCallback(async (entryId: string, issueId: number) => {
    if (!issueId) return
    try {
      const response = await fetch("/api/time-entries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entryId, redmineIssueId: issueId }) })
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? "No se ha podido asignar la issue.")
      setEntries((current) => current.map((entry) => entry.id === entryId ? { ...entry, redmineIssueId: issueId } : entry))
    } catch (assignError) {
      setError((assignError as Error).message)
    }
  }, [])

  const columns = useMemo(() => createPendingHoursColumns(actions, (id, action) => setActions((current) => ({ ...current, [id]: action })), issuesByProject, loadingIssues, (id) => void loadIssues(id), (id, issueId) => void assignIssue(id, issueId)), [actions, issuesByProject, loadingIssues, loadIssues, assignIssue])
  const table = useTable({ features, data, columns })

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando horas pendientes...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>
  return <div className="overflow-hidden rounded-md border"><Table><TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay horas pendientes.</TableCell></TableRow>}</TableBody></Table></div>
}
