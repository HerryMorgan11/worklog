import { getOrCreateCurrentUser } from "@/server/services/create-user-service"
import {
  getRedmineSettings,
  RedmineConfigError,
  saveRedmineSettings,
  testRedmineConnection,
  type RedmineConfigInput,
} from "@/server/services/redmine-config-service"

async function currentUser() {
  return getOrCreateCurrentUser()
}

async function requestBody(request: Request): Promise<RedmineConfigInput> {
  try {
    return await request.json()
  } catch {
    throw new RedmineConfigError("La solicitud no es válida.")
  }
}

function errorResponse(error: unknown) {
  const message = error instanceof RedmineConfigError ? error.message : "No se ha podido completar la operación."
  return Response.json({ error: message }, { status: 400 })
}

export async function GET() {
  const user = await currentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const config = await getRedmineSettings(user.id)
  return Response.json({
    baseUrl: config?.baseUrl ?? "",
    hasApiKey: Boolean(config?.apiKeyEncrypted),
    lastConnectionAt: config?.lastConnectionAt?.toISOString() ?? null,
  })
}

export async function PUT(request: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const config = await saveRedmineSettings(user.id, await requestBody(request))
    return Response.json({ baseUrl: config.baseUrl, hasApiKey: Boolean(config.apiKeyEncrypted) })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    return Response.json(await testRedmineConnection(user.id, await requestBody(request)))
  } catch (error) {
    return errorResponse(error)
  }
}
