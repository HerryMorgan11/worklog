import { auth } from "@clerk/nextjs/server";
import { getTimeEntries } from "@/server/services/get-time-entry-service";
import { CreateTimeEntryService } from "@/server/services/create-time-entry-service";
import { getUserByClerkUserId } from "@/server/repository/create-user.repository";
import { assignTimeEntryIssue } from "@/server/services/assign-time-entry-issue-service";

type CreateTimeEntryRequest = {
  date?: unknown;
  hours?: unknown;
  description?: unknown;
  title?: unknown;
  projectId?: unknown;
  redmineProjectId?: unknown;
};

type AssignIssueRequest = {
  id?: unknown;
  redmineIssueId?: unknown;
};

function parseProjectId(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    if (Number.isSafeInteger(value) && value > 0) {
      return value;
    }

    throw new Error("El ID del proyecto no es válido.");
  }

  if (typeof value !== "string") {
    throw new Error("El proyecto debe tener el formato 'ID | Nombre del proyecto'.");
  }

  const id = value.split("|", 1)[0]?.trim();
  if (!id || !/^\d+$/.test(id)) {
    throw new Error("El proyecto debe tener el formato 'ID | Nombre del proyecto'.");
  }

  const projectId = Number(id);
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new Error("El ID del proyecto no es válido.");
  }

  return projectId;
}

async function getAuthenticatedUser() {
  const authObject = await auth({
    acceptsToken: ["session_token", "api_key"],
  });

  if (!authObject.isAuthenticated) {
    return null;
  }

  const clerkUserId =
    authObject.tokenType === "api_key"
      ? authObject.subject
      : authObject.userId;

  return getUserByClerkUserId(clerkUserId);
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: CreateTimeEntryRequest = await req.json();
    const redmineProjectId = parseProjectId(
      body.projectId ?? body.redmineProjectId,
    );

    if (
      typeof body.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
      typeof body.hours !== "number" ||
      !Number.isFinite(body.hours) ||
      (body.description !== undefined && typeof body.description !== "string") ||
      (body.title !== undefined && typeof body.title !== "string")
    ) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const timeEntry = await CreateTimeEntryService({
      userId: user.id,
      date: body.date,
      hours: body.hours,
      description: body.description,
      title: body.title,
      redmineProjectId,
    });

    return Response.json(timeEntry, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedStatus = searchParams.get("status");

  if (requestedStatus && requestedStatus !== "pending") {
    return Response.json(
      { error: "status must be pending when it is provided" },
      { status: 400 },
    );
  }

  const entries = await getTimeEntries({
    userId: user.id,
    status: requestedStatus === "pending" ? "DRAFT" : undefined,
  });

  return Response.json(entries);
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: AssignIssueRequest = await req.json();
    if (
      typeof body.id !== "string" ||
      typeof body.redmineIssueId !== "number" ||
      !Number.isSafeInteger(body.redmineIssueId) ||
      body.redmineIssueId <= 0
    ) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    return Response.json(await assignTimeEntryIssue({
      userId: user.id,
      timeEntryId: body.id,
      redmineIssueId: body.redmineIssueId,
    }));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
