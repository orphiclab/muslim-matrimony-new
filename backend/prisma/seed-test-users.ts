import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Test@1234', 10);

  // ── User 1: Ahmed ──────────────────────────────────────────
  const user1 = await prisma.user.upsert({
    where: { email: 'ahmed@test.com' },
    update: { password },
    create: { email: 'ahmed@test.com', password, phone: '0711000001', role: 'PARENT' },
  });

  // ── User 2: Fatima ─────────────────────────────────────────
  const user2 = await prisma.user.upsert({
    where: { email: 'fatima@test.com' },
    update: { password },
    create: { email: 'fatima@test.com', password, phone: '0711000002', role: 'PARENT' },
  });

  // ── Profile for Ahmed (ACTIVE) ─────────────────────────────
  const existingP1 = await prisma.childProfile.findFirst({ where: { userId: user1.id } });
  let profile1;
  if (!existingP1) {
    profile1 = await prisma.childProfile.create({
      data: {
        userId:      user1.id,
        memberId:    'MN-AHMED-001',
        name:        'Ahmed Hassan',
        gender:      'MALE',
        dateOfBirth: new Date('1995-04-15'),
        country:     'Sri Lanka',
        city:        'Colombo',
        education:   "Bachelor's Degree",
        occupation:  'Software Engineer',
        status:      'ACTIVE',
        contactVisible: true,
      },
    });
  } else {
    profile1 = await prisma.childProfile.update({
      where: { id: existingP1.id },
      data: { status: 'ACTIVE', name: 'Ahmed Hassan' },
    });
  }

  // Subscription for Ahmed
  await prisma.subscription.upsert({
    where:  { childProfileId: profile1.id },
    update: { status: 'ACTIVE', endDate: new Date(Date.now() + 30 * 864e5) },
    create: {
      childProfileId:   profile1.id,
      status:           'ACTIVE',
      startDate:        new Date(),
      endDate:          new Date(Date.now() + 30 * 864e5),
    },
  });

  // ── Profile for Fatima (ACTIVE) ────────────────────────────
  const existingP2 = await prisma.childProfile.findFirst({ where: { userId: user2.id } });
  let profile2;
  if (!existingP2) {
    profile2 = await prisma.childProfile.create({
      data: {
        userId:      user2.id,
        memberId:    'MN-FATIMA-002',
        name:        'Fatima Noor',
        gender:      'FEMALE',
        dateOfBirth: new Date('1997-08-22'),
        country:     'Sri Lanka',
        city:        'Kandy',
        education:   "Master's Degree",
        occupation:  'Doctor',
        status:      'ACTIVE',
        contactVisible: true,
      },
    });
  } else {
    profile2 = await prisma.childProfile.update({
      where: { id: existingP2.id },
      data: { status: 'ACTIVE', name: 'Fatima Noor' },
    });
  }

  // Subscription for Fatima
  await prisma.subscription.upsert({
    where:  { childProfileId: profile2.id },
    update: { status: 'ACTIVE', endDate: new Date(Date.now() + 30 * 864e5) },
    create: {
      childProfileId:   profile2.id,
      status:           'ACTIVE',
      startDate:        new Date(),
      endDate:          new Date(Date.now() + 30 * 864e5),
    },
  });

  console.log('✅ Test users seeded successfully!');
  console.log('   ahmed@test.com  / Test@1234  → Ahmed Hassan  (ACTIVE, MALE)');
  console.log('   fatima@test.com / Test@1234  → Fatima Noor   (ACTIVE, FEMALE)');
  console.log('   Ahmed profile ID : ' + profile1.id);
  console.log('   Fatima profile ID: ' + profile2.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
