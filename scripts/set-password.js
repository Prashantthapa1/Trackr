// scripts/set-password.js
// Usage: node scripts/set-password.js <email> <password>
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/set-password.js <email> <password>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { email },
      data: { hashedPassword: hashed },
      select: { id: true, email: true, name: true, plan: true },
    });
    console.log('✅ Updated password for user:', user);
  } catch (err) {
    console.error('❌ Failed to update password:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
