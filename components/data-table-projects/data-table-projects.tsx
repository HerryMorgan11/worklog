"use client"

import { useEffect, useMemo, useState } from "react"
import { useTable } from "@tanstack/react-table"

import {
  createPendingHoursColumns,
  type PendingAction,
  type Projects,
} from "./columns-projects"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { features } from "../shared/data-table-features"
import { useCurrentUserId } from "@/components/providers/current-user-provider"

type TimeEntryResponse = {
  id: string
  date: string
  hours: number
  redmineIssueId: number | null
  redmineProjectId: number | null
}

function toPendingTimeEntry(entry: TimeEntryResponse): Projects {
  return {
    id: entry.id,
    taskTitle: entry.redmineIssueId
      ? `Tarea #${entry.redmineIssueId}`
      : "Sin tarea vinculada",
    projectName: entry.redmineProjectId
      ? `Proyecto #${entry.redmineProjectId}`
      : "Sin proyecto vinculado",
    date: entry.date,
    hours: entry.hours,
  }
}

export function ProjectsTable() {
  const userId = useCurrentUserId()
  const [data, setData] = useState<Projects[]>([])
  const [actions, setActions] = useState<Record<string, PendingAction>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({ userId, status: "pending" })

    async function loadPendingHours() {
      setIsLoading(true)
      setError(null)
      setActions({})

      try {
        const response = await fetch(`/api/time-entries?${params}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("No se han podido cargar las horas pendientes")
        }

        const entries: TimeEntryResponse[] = await response.json()
        setData(entries.map(toPendingTimeEntry))
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setError((error as Error).message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadPendingHours()

    return () => controller.abort()
  }, [userId])

  const columns = useMemo(
    () =>
      createPendingHoursColumns(actions, (id, action) => {
        setActions((current) => ({ ...current, [id]: action }))
      }),
    [actions]
  )

  const table = useTable({ features, data, columns })

  if (!userId) {
    return (
      <p className="text-sm text-destructive">
        No se ha encontrado el identificador de usuario.
      </p>
    )
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando horas pendientes...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay horas pendientes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
