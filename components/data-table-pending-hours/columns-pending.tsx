"use client"

import { Check, Undo2 } from "lucide-react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "../shared/data-table-features"

export type PendingTimeEntry = {
  id: string
  taskTitle: string
  projectName: string
  date: string
  hours: number
}

export type PendingAction = "approve" | "revoke"

const columnHelper = createColumnHelper<DataTableFeatures, PendingTimeEntry>()

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES").format(
    new Date(`${date}T00:00:00`)
  )
}

export function createPendingHoursColumns(
  actions: Record<string, PendingAction>,
  onAction: (id: string, action: PendingAction) => void
): ColumnDef<DataTableFeatures, PendingTimeEntry>[] {
  return columnHelper.columns([
    columnHelper.accessor("taskTitle", { header: "Tarea" }),
    columnHelper.accessor("projectName", { header: "Proyecto" }),
    columnHelper.accessor("date", {
      header: "Fecha",
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("hours", {
      header: "Horas realizadas",
      cell: (info) => `${info.getValue()} h`,
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => {
        const entryId = info.row.original.id
        const action = actions[entryId]

        if (action) {
          return (
            <Button disabled size="sm" variant="secondary">
              {action === "approve" ? <Check /> : <Undo2 />}
              {action === "approve" ? "Aprobada" : "Revocada"}
            </Button>
          )
        }

        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAction(entryId, "approve")}>
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction(entryId, "revoke")}
            >
              Revocar
            </Button>
          </div>
        )
      },
    }),
  ])
}
