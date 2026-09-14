import { getIssuesRedmine } from "./get-issues-redmine";
import { assignIssueToTimeEntry } from "../repository/time-entry.repository";
import { getTimeEntriesByUserId } from "../repository/get-time-entry.repository";

export async function assignTimeEntryIssue({
  userId,
  timeEntryId,
  redmineIssueId,
}: {
  userId: string;
  timeEntryId: string;
  redmineIssueId: number;
}) {
  const entries = await getTimeEntriesByUserId({ userId });
  const entry = entries.find((item) => item.id === timeEntryId);
  if (!entry) throw new Error("La entrada de tiempo no existe.");
  if (!entry.redmineProjectId) throw new Error("La entrada no tiene un proyecto de Redmine asignado.");

  const issues = await getIssuesRedmine(entry.redmineProjectId);
  if (!issues.some((issue) => issue.id === redmineIssueId)) {
    throw new Error("La issue no pertenece al proyecto asignado.");
  }

  const updatedEntry = await assignIssueToTimeEntry({
    id: timeEntryId,
    userId,
    redmineIssueId,
  });
  if (!updatedEntry) throw new Error("No se ha podido actualizar la entrada de tiempo.");
  return updatedEntry;
}
