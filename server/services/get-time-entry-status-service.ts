import { getTimeEntries } from './get-time-entry-service';

export async function getPendingTimeEntries(userId: string) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    return getTimeEntries({ userId, status: 'DRAFT' });
}
