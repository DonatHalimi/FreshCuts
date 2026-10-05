import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

const providerSelect = {
  id: true,
  name: true,
  title: true,
  bio: true,
  imageUrl: true,
};

export async function listProviders({ page, limit, serviceId, q }) {
  const skip = (page - 1) * limit;
  const where = {
    isActive: true,
    ...(q
      ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
        ],
      }
      : {}),
    ...(serviceId
      ? {
        services: {
          some: { serviceId },
        },
      }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.provider.findMany({
      where,
      select: {
        ...providerSelect,
        services: {
          select: {
            service: {
              select: { id: true, name: true, durationMin: true, priceCents: true },
            },
            priceCents: true,
          },
          orderBy: { service: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.provider.count({ where }),
  ]);

  return {
    rows: rows.map((provider) => ({
      ...provider,
      services: provider.services.map((entry) => ({
        ...entry.service,
        priceCents: entry.priceCents ?? entry.service.priceCents,
      })),
    })),
    total,
  };
}

export async function getProviderById(id) {
  const provider = await prisma.provider.findFirst({
    where: { id, isActive: true },
    select: {
      ...providerSelect,
      services: {
        select: {
          service: {
            select: { id: true, name: true, description: true, durationMin: true, priceCents: true },
          },
          priceCents: true,
        },
        orderBy: { service: { name: 'asc' } },
      },
    },
  });

  if (!provider) throw new AppError(404, 'PROVIDER_NOT_FOUND', 'Provider not found');

  return {
    ...provider,
    services: provider.services.map((entry) => ({
      ...entry.service,
      priceCents: entry.priceCents ?? entry.service.priceCents,
    })),
  };
}