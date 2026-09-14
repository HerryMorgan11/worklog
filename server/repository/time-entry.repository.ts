import { db } from '../db';
import { timeEntries } from '../db/schemas/time-entries';

export async function CreateTimeEntry(data: {
    userId: string;
    date: string;
    hours: number;
    description?: string;
}) {
    const [entry] = await db
        .insert(timeEntries)
        .values({
            userId: data.userId,
            date: data.date,
            hours: data.hours,
            description: data.description,
        })
        .returning();

    return entry;
}
