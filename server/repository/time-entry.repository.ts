import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { timeEntries } from '../db/schemas/time-entries';

export async function CreateTimeEntry(data: {
    userId: string;
    date: string;
    hours: number;
    description?: string;
    title?: string;
    redmineProjectId?: number;
}) {
    const [entry] = await db
        .insert(timeEntries)
        .values({
            userId: data.userId,
            date: data.date,
            hours: data.hours,
            description: data.description,
            title: data.title,
            redmineProjectId: data.redmineProjectId,
        })
        .returning();

    return entry;
}

export async function assignIssueToTimeEntry({
    id,
    userId,
    redmineIssueId,
}: {
    id: string;
    userId: string;
    redmineIssueId: number;
}) {
    const [entry] = await db
        .update(timeEntries)
        .set({ redmineIssueId, updatedAt: new Date() })
        .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)))
        .returning();

    return entry ?? null;
}
