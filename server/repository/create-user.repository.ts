import "server-only";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type NewUser, type User } from "../db/schemas/users";

export type CreateUserData = Pick<
  NewUser,
  "clerkUserId" | "email" | "name" | "avatarUrl"
>;

export async function getUserByClerkUserId(
  clerkUserId: string,
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return user ?? null;
}

export async function createUser(data: CreateUserData): Promise<User> {
  const [createdUser] = await db
    .insert(users)
    .values(data)
    .onConflictDoNothing({ target: users.clerkUserId })
    .returning();

  if (createdUser) {
    return createdUser;
  }

  const existingUser = await getUserByClerkUserId(data.clerkUserId);

  if (!existingUser) {
    throw new Error("User could not be created");
  }

  return existingUser;
}
