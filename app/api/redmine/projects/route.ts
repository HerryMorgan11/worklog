import { auth } from "@clerk/nextjs/server";

import { getProjectsRedmine } from "@/server/services/get-projects-redmine";

export async function GET() {
  const authObject = await auth({ acceptsToken: ["session_token", "api_key"] });
  if (!authObject.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getProjectsRedmine();
    return Response.json(projects.map(({ id, name }) => ({ id, name })));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
