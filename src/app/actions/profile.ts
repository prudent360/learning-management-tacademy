"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function updateCertificateName(name: string): Promise<void> {
  const { userId } = await verifySession();
  const trimmed = name.trim();
  await prisma.user.update({
    where: { id: userId },
    data: { certificateName: trimmed.length > 0 ? trimmed : null },
  });
}
