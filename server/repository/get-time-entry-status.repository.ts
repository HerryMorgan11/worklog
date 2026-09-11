import {
    getTimeEntriesByUserId,
    type GetTimeEntriesParams,
} from './get-time-entry.repository';
import type { TimeEntryStatus } from '../db/schemas/time-entries';

export type { TimeEntryStatus };

export async function getTimeEntriesByUserIdAndStatus(
    userId: string,
    status: TimeEntryStatus,
) {
    const params: GetTimeEntriesParams = { userId, status };
    return getTimeEntriesByUserId(params);
}
