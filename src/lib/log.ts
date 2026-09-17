import { prisma } from "@/lib/prisma";

export async function logAktivitas({
  userId,
  tiketId,
  aksi,
  detail,
}: {
  userId?: number;
  tiketId?: number;
  aksi: string;
  detail?: string;
}) {
  await prisma.logAktivitas.create({
    data: {
      userId: userId ?? null,
      tiketId: tiketId ?? null,
      aksi,
      detail: detail ?? null,
    },
  });
}
