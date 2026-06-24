import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      avatar: clerkUser.imageUrl,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  // Simple admin check via env secret header — extend with role-based logic if needed
  return userId;
}
