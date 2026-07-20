"use server";

import { prisma } from "@/lib/prisma";
import { verifySession, getCurrentUser } from "@/lib/dal";

export async function getCommentsAction(lessonId: string) {
  await verifySession();

  return await prisma.discussionComment.findMany({
    where: { lessonId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function addCommentAction(lessonId: string, content: string, parentId?: string) {
  const { userId } = await verifySession();
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Comment content cannot be empty");

  const comment = await prisma.discussionComment.create({
    data: {
      lessonId,
      userId,
      content: trimmed,
      parentId: parentId || null,
    },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return comment;
}

export async function deleteCommentAction(commentId: string) {
  const user = await getCurrentUser();

  const comment = await prisma.discussionComment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("You do not have permission to delete this comment");
  }

  await prisma.discussionComment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
