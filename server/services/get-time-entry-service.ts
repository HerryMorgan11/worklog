import {
    getTimeEntriesByUserId,
    type GetTimeEntriesParams,
} from '../repository/get-time-entry.repository';

export async function getTimeEntries(params: GetTimeEntriesParams) {
    const { userId } = params;

    if (!userId) {
        throw new Error('User ID is required');
    }

    return getTimeEntriesByUserId(params);
}
