import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "thaprasha23@gmail.com";
  const name = "Admin";
  const password = "VeryStrong"; // change before running
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      hashedPassword,
      plan: "PRO",
      subscriptionId: "manual-admin-grant",
    },
    create: {
      email,
      name,
      hashedPassword,
      plan: "PRO",
      subscriptionId: "manual-admin-grant",
    },
    select: { id: true, email: true, name: true, plan: true },
  });

  console.log("Admin user created/updated:", user);
}

main()
  .catch((e) => {
    console.error("Error creating admin user:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());