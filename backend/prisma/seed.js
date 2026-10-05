import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const providers = [
  {
    name: 'Ardit Krasniqi',
    title: 'Master Barber',
    bio: 'Specializes in fades, clean classic cuts, and modern styling.',
    imageUrl: null,
  },
  {
    name: 'Luan Berisha',
    title: 'Senior Barber',
    bio: 'Focused on precision fades, beard shaping, and low-maintenance styles.',
    imageUrl: null,
  },
  {
    name: 'Eli Fara',
    title: 'Stylist',
    bio: 'Known for textured cuts, styling, and polished everyday looks.',
    imageUrl: null,
  },
];

const services = [
  {
    name: 'Classic Haircut',
    description: 'A clean, tailored cut finished with styling.',
    durationMin: 30,
    priceCents: 1500,
  },
  {
    name: 'Skin Fade',
    description: 'Detailed fade with a precise neckline and finish.',
    durationMin: 40,
    priceCents: 1800,
  },
  {
    name: 'Haircut + Beard',
    description: 'Full haircut with beard trim and shape-up.',
    durationMin: 50,
    priceCents: 2200,
  },
  {
    name: 'Beard Trim',
    description: 'Shape, trim, neckline, and finishing product.',
    durationMin: 20,
    priceCents: 900,
  },
  {
    name: 'Kids Haircut',
    description: 'A simple, comfortable haircut for younger clients.',
    durationMin: 25,
    priceCents: 1200,
  },
  {
    name: 'Hot Towel Shave',
    description: 'Traditional straight-razor shave with hot towel prep and aftercare.',
    durationMin: 30,
    priceCents: 1600,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
  }

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: provider,
      create: provider,
    });
  }

  const providerRows = await prisma.provider.findMany({ select: { id: true } });
  const serviceRows = await prisma.service.findMany({ select: { id: true } });

  for (const provider of providerRows) {
    for (const service of serviceRows) {
      await prisma.providerService.upsert({
        where: {
          providerId_serviceId: {
            providerId: provider.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          providerId: provider.id,
          serviceId: service.id,
        },
      });
    }
  }

  console.log('FreshCuts seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
