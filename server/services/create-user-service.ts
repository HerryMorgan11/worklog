import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createUser,
  getUserByClerkUserId,
} from "../repository/create-user.repository";

export async function getOrCreateCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const existingUser = await getUserByClerkUserId(userId);

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ");

  return createUser({
    clerkUserId: clerkUser.id,
    email:
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null,
    name: fullName || clerkUser.username || null,
    avatarUrl: clerkUser.imageUrl || null,
  });
}
