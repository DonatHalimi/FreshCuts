import prisma from '../database/prisma.js';

export async function listServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      durationMin: true,
      priceCents: true,
    },
    orderBy: { name: 'asc' },
  });
}