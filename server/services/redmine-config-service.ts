import "server-only"

import { getRedmineConfigByUserId, markRedmineConnection, saveRedmineConfig } from "@/server/repository/redmine-config.repository"

export type RedmineConfigInput = { baseUrl?: unknown; apiKey?: unknown }
export class RedmineConfigError extends Error {}

export function validateRedmineConfig(input: RedmineConfigInput) {
  if (typeof input.baseUrl !== "string" || input.baseUrl.trim().length === 0) throw new RedmineConfigError("La URL de Redmine es obligatoria.")
  if (input.baseUrl.length > 2048) throw new RedmineConfigError("La URL de Redmine es demasiado larga.")

  let parsedUrl: URL
  try { parsedUrl = new URL(input.baseUrl.trim()) } catch { throw new RedmineConfigError("Introduce una URL de Redmine válida.") }

  if (!["http:", "https:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
    throw new RedmineConfigError("La URL debe usar HTTP o HTTPS y no incluir credenciales.")
  }
  if (input.apiKey !== undefined && typeof input.apiKey !== "string") throw new RedmineConfigError("La clave API no es válida.")

  const apiKey = typeof input.apiKey === "string" ? input.apiKey.trim() : ""
  if (apiKey.length > 512) throw new RedmineConfigError("La clave API es demasiado larga.")

  return { baseUrl: parsedUrl.toString().replace(/\/$/, ""), apiKey }
}

export async function getRedmineSettings(userId: string) {
  return getRedmineConfigByUserId(userId)
}

export async function saveRedmineSettings(userId: string, input: RedmineConfigInput) {
  const values = validateRedmineConfig(input)
  const currentConfig = await getRedmineConfigByUserId(userId)
  if (!values.apiKey && !currentConfig?.apiKeyEncrypted) throw new RedmineConfigError("La clave API es obligatoria.")
  return saveRedmineConfig({ userId, currentConfig, ...values })
}

export async function testRedmineConnection(userId: string, input: RedmineConfigInput) {
  const values = validateRedmineConfig(input)
  const currentConfig = await getRedmineConfigByUserId(userId)
  const apiKey = values.apiKey || currentConfig?.apiKeyEncrypted
  if (!apiKey) throw new RedmineConfigError("Introduce una clave API para probar la conexión.")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(`${values.baseUrl}/users/current.json`, { headers: { "X-Redmine-API-Key": apiKey }, signal: controller.signal, cache: "no-store" })
    if (!response.ok) throw new RedmineConfigError(`Redmine respondió con el estado ${response.status}.`)

    const payload = (await response.json()) as { user?: { firstname?: string; lastname?: string; login?: string } }
    const name = [payload.user?.firstname, payload.user?.lastname].filter(Boolean).join(" ") || payload.user?.login
    if (currentConfig?.baseUrl === values.baseUrl) await markRedmineConnection(currentConfig.id)
    return { message: name ? `Conectado como ${name}.` : "Conexión realizada correctamente." }
  } catch (error) {
    if (error instanceof RedmineConfigError) throw error
    if (error instanceof Error && error.name === "AbortError") throw new RedmineConfigError("La conexión ha superado el tiempo de espera.")
    throw new RedmineConfigError("No se ha podido conectar con Redmine.")
  } finally {
    clearTimeout(timeout)
  }
}
