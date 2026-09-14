import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { redmineConfigs } from "@/server/db/schemas/redmine-config"

export type RedmineConfig = typeof redmineConfigs.$inferSelect

export async function getRedmineConfigByUserId(userId: string): Promise<RedmineConfig | null> {
  const [config] = await db.select().from(redmineConfigs).where(eq(redmineConfigs.userId, userId)).limit(1)
  return config ?? null
}

export async function saveRedmineConfig({ userId, baseUrl, apiKey, currentConfig }: { userId: string; baseUrl: string; apiKey: string; currentConfig: RedmineConfig | null }) {
  const values = { baseUrl, ...(apiKey ? { apiKeyEncrypted: apiKey } : {}), updatedAt: new Date() }

  if (currentConfig) {
    const [config] = await db.update(redmineConfigs).set(values).where(eq(redmineConfigs.id, currentConfig.id)).returning()
    return config
  }

  const [config] = await db.insert(redmineConfigs).values({ userId, ...values }).returning()
  return config
}

export async function markRedmineConnection(configId: string) {
  await db.update(redmineConfigs).set({ lastConnectionAt: new Date(), updatedAt: new Date() }).where(eq(redmineConfigs.id, configId))
}
