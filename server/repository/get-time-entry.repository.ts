import { db } from '../db';
import { timeEntries, type TimeEntryStatus } from '../db/schemas/time-entries';
import { and, desc, eq } from 'drizzle-orm';

export type GetTimeEntriesParams = {
    userId: string;
    status?: TimeEntryStatus;
};

export async function getTimeEntriesByUserId({
    userId,
    status,
}: GetTimeEntriesParams) {
    return db
        .select()
        .from(timeEntries)
        .where(
            status
                ? and(
                    eq(timeEntries.userId, userId),
                    eq(timeEntries.status, status),
                )
                : eq(timeEntries.userId, userId),
        )
        .orderBy(desc(timeEntries.date), desc(timeEntries.createdAt));
}
