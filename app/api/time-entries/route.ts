import {
    CreateTimeEntryService,
    getTimeEntries,
} from '../../../server/services';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const timeEntry = await CreateTimeEntryService({
            userId: body.userId,
            date: body.date,
            hours: body.hours,
            description: body.description,
        });

        return new Response(JSON.stringify(timeEntry), { status: 201 });

    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requestedStatus = searchParams.get('status');

    if (!userId) {
        return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    if (requestedStatus && requestedStatus !== 'pending') {
        return Response.json(
            { error: 'status must be pending when it is provided' },
            { status: 400 },
        );
    }

    const entries = await getTimeEntries({
        userId,
        status: requestedStatus === 'pending' ? 'DRAFT' : undefined,
    });

    return Response.json(entries);
}
