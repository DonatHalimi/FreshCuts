import bcrypt from 'bcrypt';
import prisma from '../src/database/prisma.js';

const passwordHash = await bcrypt.hash('FreshCuts123!', 12);

const menuSeeds = [
  {
    key: 'global_header',
    label: 'Main navigation',
    items: [
      { key: 'home', label: 'Home', href: '/', iconKey: 'home' },
      { key: 'providers', label: 'Providers', href: '/providers', iconKey: 'scissors' },
      { key: 'services', label: 'Services', href: '/services', iconKey: 'calendar' },
      { key: 'appointments', label: 'Appointments', href: '/account/appointments', iconKey: 'calendar', requiredPermissions: ['appointments.read'] },
      { key: 'login', label: 'Log in', href: '/login', requiredPermissions: ['guest.read'] },
      { key: 'register', label: 'Create account', href: '/register', requiredPermissions: ['guest.read'] },
    ],
  },
  {
    key: 'user_dropdown',
    label: 'User menu',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/admin', iconKey: 'dashboard', requiredPermissions: ['admin.read'] },
      { key: 'profile', label: 'Profile', href: '/profile', iconKey: 'user', requiredPermissions: ['account.read'] },
      { key: 'appointments', label: 'Appointments', href: '/account/appointments', iconKey: 'calendar', requiredPermissions: ['appointments.read'] },
      { key: 'history', label: 'Service history', href: '/account/history', iconKey: 'clock', requiredPermissions: ['account.read'] },
    ],
  },
  {
    key: 'user_profile_sidebar',
    label: 'Account sidebar',
    items: [
      {
        key: 'discover',
        label: 'Discover',
        iconKey: 'home',
        children: [
          { key: 'home', label: 'Home', href: '/', iconKey: 'home' },
          { key: 'providers', label: 'Providers', href: '/providers', iconKey: 'scissors' },
          { key: 'services', label: 'Services', href: '/services', iconKey: 'calendar' },
        ],
      },
      {
        key: 'account',
        label: 'Account',
        iconKey: 'settings',
        children: [
          { key: 'profile', label: 'Profile', href: '/profile', iconKey: 'user', requiredPermissions: ['account.read'] },
          { key: 'appointments', label: 'Appointments', href: '/account/appointments', iconKey: 'calendar', requiredPermissions: ['appointments.read'] },
          { key: 'history', label: 'Service history', href: '/account/history', iconKey: 'clock', requiredPermissions: ['account.read'] },
          { key: 'notifications', label: 'Notifications', href: '/account/notifications', iconKey: 'bell', requiredPermissions: ['account.read'] },
        ],
      },
    ],
  },
  {
    key: 'admin_panel',
    label: 'Admin dashboard',
    items: [
      {
        key: 'admin_pages',
        label: 'Admin pages',
        iconKey: 'security',
        requiredPermissions: ['admin.read'],
        children: [
          { key: 'dashboard', label: 'Dashboard', href: '/admin', iconKey: 'dashboard', requiredPermissions: ['admin.read'] },
          { key: 'appointments', label: 'Appointments', href: '/admin/appointments', iconKey: 'calendar', requiredPermissions: ['admin.read'] },
          { key: 'users', label: 'Users', href: '/admin/users', iconKey: 'users', requiredPermissions: ['admin.read'] },
          { key: 'providers', label: 'Barbers', href: '/admin/providers', iconKey: 'user', requiredPermissions: ['admin.read'] },
          { key: 'services', label: 'Services', href: '/admin/services', iconKey: 'scissors', requiredPermissions: ['admin.read'] },
          { key: 'menus', label: 'Navigation menus', href: '/admin/menus', iconKey: 'menu', requiredPermissions: ['admin.read'] },
        ],
      },
    ],
  },
  {
    key: 'staff_panel',
    label: 'Staff portal',
    items: [
      {
        key: 'staff_pages',
        label: 'Staff pages',
        iconKey: 'user',
        requiredPermissions: ['staff.read'],
        children: [
          { key: 'dashboard', label: 'Dashboard', href: '/staff', iconKey: 'dashboard', requiredPermissions: ['staff.read'] },
          { key: 'roster', label: 'Roster', href: '/staff/roster', iconKey: 'calendar', requiredPermissions: ['staff.read'] },
          { key: 'schedule', label: 'Schedule', href: '/staff/schedule', iconKey: 'clock', requiredPermissions: ['staff.read'] },
          { key: 'profile', label: 'Profile', href: '/staff/profile', iconKey: 'user', requiredPermissions: ['staff.read'] },
        ],
      },
    ],
  },
];

async function seedMenus() {
  for (const menuSeed of menuSeeds) {
    const menu = await prisma.menu.upsert({
      where: { key: menuSeed.key },
      update: {},
      create: { key: menuSeed.key, label: menuSeed.label },
    });

    async function seedItems(items, parentId = null) {
      for (const [position, item] of items.entries()) {
        const menuItem = await prisma.menuItem.upsert({
          where: { menuId_key: { menuId: menu.id, key: item.key } },
          update: {},
          create: {
            menuId: menu.id,
            key: item.key,
            parentId,
            label: item.label,
            href: item.href ?? null,
            iconKey: item.iconKey ?? null,
            requiredPermissions: item.requiredPermissions ?? [],
            position,
          },
        });
        if (item.children) await seedItems(item.children, menuItem.id);
      }
    }

    await seedItems(menuSeed.items);
  }
}

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@freshcuts.local' },
    update: {},
    create: {
      email: 'admin@freshcuts.local',
      passwordHash,
      firstName: 'FreshCuts',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });

  await seedMenus();

  const staffData = [
    { firstName: 'Ardit', lastName: 'Krasniqi', email: 'ardit@freshcuts.local', title: 'Master Barber', bio: 'Specializes in fades, clean classic cuts, and modern styling.' },
    { firstName: 'Luan', lastName: 'Berisha', email: 'luan@freshcuts.local', title: 'Senior Barber', bio: 'Focused on precision fades, beard shaping, and low-maintenance styles.' },
    { firstName: 'Eli', lastName: 'Fara', email: 'eli@freshcuts.local', title: 'Stylist', bio: 'Known for textured cuts, styling, and polished everyday looks.' },
  ];

  const providers = [];

  for (const staff of staffData) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        email: staff.email,
        passwordHash,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: 'PROVIDER',
        emailVerifiedAt: new Date(),
      },
    });

    const providerName = `${staff.firstName} ${staff.lastName}`;
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: { name: providerName, title: staff.title, bio: staff.bio, isActive: true },
      create: {
        userId: user.id,
        name: providerName,
        title: staff.title,
        bio: staff.bio,
      },
    });

    providers.push(provider);
  }

  const servicesData = [
    { name: 'Classic Haircut', description: 'A clean, tailored cut finished with styling.', durationMin: 30, priceCents: 1500, bufferBeforeMin: 0, bufferAfterMin: 5 },
    { name: 'Skin Fade', description: 'Detailed fade with a precise neckline and finish.', durationMin: 40, priceCents: 1800, bufferBeforeMin: 0, bufferAfterMin: 5 },
    { name: 'Haircut + Beard', description: 'Full haircut with beard trim and shape-up.', durationMin: 50, priceCents: 2200, bufferBeforeMin: 0, bufferAfterMin: 10 },
    { name: 'Beard Trim', description: 'Shape, trim, neckline, and finishing product.', durationMin: 20, priceCents: 900, bufferBeforeMin: 0, bufferAfterMin: 5 },
    { name: 'Kids Haircut', description: 'A simple, comfortable haircut for younger clients.', durationMin: 25, priceCents: 1200, bufferBeforeMin: 0, bufferAfterMin: 5 },
    { name: 'Hot Towel Shave', description: 'Traditional straight-razor shave with hot towel prep and aftercare.', durationMin: 30, priceCents: 1600, bufferBeforeMin: 0, bufferAfterMin: 5 },
  ];

  const services = [];
  for (const service of servicesData) {
    const createdService = await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
    services.push(createdService);
  }

  for (const provider of providers) {
    for (const service of services) {
      await prisma.providerService.upsert({
        where: { providerId_serviceId: { providerId: provider.id, serviceId: service.id } },
        update: {},
        create: { providerId: provider.id, serviceId: service.id },
      });
    }

    for (let day = 1; day <= 6; day += 1) {
      const workingHour = await prisma.workingHour.findFirst({
        where: { providerId: provider.id, dayOfWeek: day },
      });
      if (!workingHour) {
        await prisma.workingHour.create({
          data: { providerId: provider.id, dayOfWeek: day, startMin: 540, endMin: 1080 },
        });
      }

      const scheduleBreak = await prisma.scheduleBreak.findFirst({
        where: { providerId: provider.id, dayOfWeek: day },
      });
      if (!scheduleBreak) {
        await prisma.scheduleBreak.create({
          data: { providerId: provider.id, dayOfWeek: day, startMin: 780, endMin: 840, label: 'Lunch' },
        });
      }
    }
  }

  console.log(`FreshCuts v2 seed complete: 1 Admin, ${providers.length} Staff Providers, and ${services.length} Services created.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });