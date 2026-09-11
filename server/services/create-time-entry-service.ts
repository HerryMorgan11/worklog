import { CreateTimeEntry } from '../repository/time-entry.repository';

export async function CreateTimeEntryService(data: {
    userId: string;
    date: string;
    hours: number;
    description?: string;
}){
    if (data.hours <= 0) {
        throw new Error('Hours must be greater than 0');
    }

    return CreateTimeEntry({
       userId: data.userId,
       date: data.date,
       hours: data.hours,
       description: data.description,
   });
}