/**
 * Seed script: creates 2 test users with ACTIVE profiles + subscriptions
 * Run: npx ts-node prisma/seed-chat-test.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Test@1234', 10);

  // ── User 1: Alice (FEMALE) ────────────────────────────────────────
  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: { email: 'alice@test.com', password, phone: '0711234567', role: 'PARENT' },
  });

  const aliceProfile = await prisma.childProfile.upsert({
    where: { memberId: 'MN-000001' },
    update: { status: 'ACTIVE' },
    create: {
      memberId: 'MN-000001',
      userId: alice.id,
      name: 'Fatima Rashid',
      gender: 'FEMALE',
      dateOfBirth: new Date('1997-05-15'),
      country: 'Sri Lanka',
      city: 'Colombo',
      education: "Bachelor of Arts",
      occupation: 'Teacher',
      civilStatus: 'Never Married',
      height: 162,
      aboutUs: 'Assalamu Alaikum. I am a dedicated and faith-driven individual looking for a righteous partner.',
      expectations: 'Looking for a kind-hearted, practicing Muslim with good values and family orientation.',
      status: 'ACTIVE',
      contactVisible: true,
    },
  });

  await prisma.subscription.upsert({
    where: { childProfileId: aliceProfile.id },
    update: { status: 'ACTIVE', endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000) },
    create: {
      childProfileId: aliceProfile.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      planName: 'standard',
      planDurationDays: 30,
    },
  });

  console.log(`✅ Alice (alice@test.com / Test@1234) profile: ${aliceProfile.id}`);

  // ── User 2: Bob (MALE) ────────────────────────────────────────────
  const bob = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: { email: 'bob@test.com', password, phone: '0719876543', role: 'PARENT' },
  });

  const bobProfile = await prisma.childProfile.upsert({
    where: { memberId: 'MN-000002' },
    update: { status: 'ACTIVE' },
    create: {
      memberId: 'MN-000002',
      userId: bob.id,
      name: 'Ahmed Hassan',
      gender: 'MALE',
      dateOfBirth: new Date('1994-08-20'),
      country: 'Sri Lanka',
      city: 'Kandy',
      education: 'Bachelor of Engineering',
      occupation: 'Software Engineer',
      civilStatus: 'Never Married',
      height: 178,
      aboutUs: 'Wa Alaikum Assalam. I am a software engineer with strong Islamic values, seeking a compatible partner.',
      expectations: 'Seeking a practicing Muslimah who values family and has a positive, warm personality.',
      status: 'ACTIVE',
      contactVisible: true,
    },
  });

  await prisma.subscription.upsert({
    where: { childProfileId: bobProfile.id },
    update: { status: 'ACTIVE', endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000) },
    create: {
      childProfileId: bobProfile.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      planName: 'standard',
      planDurationDays: 30,
    },
  });

  console.log(`✅ Bob (bob@test.com / Test@1234) profile: ${bobProfile.id}`);
  console.log('\n🎉 Seed complete! Login with either account to test chat.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
