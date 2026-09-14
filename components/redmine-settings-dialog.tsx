"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, LoaderCircle, Plug, Save, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ConnectionStatus = { type: "success" | "error"; message: string } | null

export function RedmineSettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [baseUrl, setBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [hasApiKey, setHasApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<ConnectionStatus>(null)

  useEffect(() => {
    if (!open) return
    void Promise.resolve().then(() => {
      setStatus(null)
      setLoading(true)
      return fetch("/api/redmine-config")
    })
      .then(async (response) => ({ response, data: await response.json() as { baseUrl?: string; hasApiKey?: boolean } }))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error()
        setBaseUrl(data.baseUrl ?? "")
        setHasApiKey(Boolean(data.hasApiKey))
        setApiKey("")
      })
      .catch(() => setStatus({ type: "error", message: "No se ha podido cargar la configuración." }))
      .finally(() => setLoading(false))
  }, [open])

  async function submit(endpoint: "" | "/test") {
    const isTest = endpoint === "/test"
    setStatus(null)
    if (isTest) {
      setTesting(true)
    } else {
      setSaving(true)
    }

    try {
      const response = await fetch("/api/redmine-config", {
        method: isTest ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey }),
      })
      const data = await response.json() as { error?: string; message?: string; hasApiKey?: boolean }
      if (!response.ok) throw new Error(data.error ?? "No se ha podido completar la operación.")

      if (isTest) {
        setStatus({ type: "success", message: data.message ?? "Conexión realizada correctamente." })
      } else {
        setHasApiKey(Boolean(data.hasApiKey))
        setApiKey("")
        setStatus({ type: "success", message: "Configuración guardada correctamente." })
      }
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Ha ocurrido un error." })
    } finally {
      if (isTest) {
        setTesting(false)
      } else {
        setSaving(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración de Redmine</DialogTitle>
          <DialogDescription>Conecta tu cuenta para sincronizar los partes de horas con Redmine.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="redmine-url">URL de Redmine</Label>
            <Input id="redmine-url" type="url" placeholder="https://redmine.ejemplo.com" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} disabled={loading || saving || testing} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="redmine-api-key">Clave API</Label>
            <Input id="redmine-api-key" type="password" autoComplete="new-password" placeholder={hasApiKey ? "••••••••  (dejar vacío para conservarla)" : "Tu clave API de Redmine"} value={apiKey} onChange={(event) => setApiKey(event.target.value)} disabled={loading || saving || testing} />
            {hasApiKey && <p className="text-xs text-muted-foreground">Ya hay una clave API guardada.</p>}
          </div>
          {status && (
            <p className={`flex items-center gap-2 text-sm ${status.type === "success" ? "text-emerald-600" : "text-destructive"}`} role="status">
              {status.type === "success" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {status.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => void submit("/test")} disabled={loading || saving || testing}>
            {testing ? <LoaderCircle className="animate-spin" /> : <Plug />}
            Probar conexión
          </Button>
          <Button onClick={() => void submit("")} disabled={loading || saving || testing}>
            {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
