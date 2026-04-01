import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@muslimnikah.com' },
    update: { password, role: 'ADMIN' },
    create: { email: 'admin@muslimnikah.com', password, phone: '0000000000', role: 'ADMIN' },
  });

  console.log(`✅ Admin (admin@muslimnikah.com / Admin@1234) created/updated!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
