import { auth } from "@clerk/nextjs/server";

import { getIssuesRedmine } from "@/server/services/get-issues-redmine";

export async function GET(_request: Request, { params }: RouteContext<"/api/redmine/projects/[projectId]/issues">) {
  const authObject = await auth({ acceptsToken: ["session_token", "api_key"] });
  if (!authObject.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId: projectIdParam } = await params;
  const projectId = Number(projectIdParam);
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    return Response.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const issues = await getIssuesRedmine(projectId);
    return Response.json(issues.map(({ id, subject }) => ({ id, subject })));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
