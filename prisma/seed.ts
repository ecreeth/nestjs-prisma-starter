import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  console.time('🧹 Cleaned up the database...');
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  console.timeEnd('🧹 Cleaned up the database...');

  console.time('🔑 Created permissions...');
  const entities = ['user'];
  const actions = ['create', 'read', 'update', 'delete'];
  const accesses = ['own', 'any'] as const;
  for (const entity of entities) {
    for (const action of actions) {
      for (const access of accesses) {
        await prisma.permission.create({ data: { entity, action, access } });
      }
    }
  }
  console.timeEnd('🔑 Created permissions...');

  console.time('👑 Created roles...');
  await prisma.role.create({
    data: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Can access to all system resources',
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: 'any' },
        }),
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'user',
      displayName: 'User',
      description: 'Can access to its own information',
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: 'own' },
        }),
      },
    },
  });
  console.timeEnd('👑 Created roles...');

  const user1 = await prisma.user.create({
    data: {
      email: 'lisa@simpson.com',
      firstName: 'Lisa',
      lastName: 'Simpson',
      password: {
        create: {
          hash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bart@simpson.com',
      firstName: 'Bart',
      lastName: 'Simpson',
      password: {
        create: {
          hash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
        },
      },
    },
  });

  console.log({ user1, user2 });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
