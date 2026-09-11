import { PendingHoursDataTable } from "@/components/data-table-pending-hours/data-table-pending"

export default function PendingHoursPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Horas pendientes</h1>
        <p className="text-sm text-muted-foreground">
          Horas pendientes de aprobar o revocar.
        </p>
      </div>

      <PendingHoursDataTable />
    </section>
  )
}
