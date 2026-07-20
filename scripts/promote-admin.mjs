import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run promote-admin -- <email>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`Promoted ${user.email} to ADMIN.`);
} catch (err) {
  if (err.code === "P2025") {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }
  throw err;
} finally {
  await prisma.$disconnect();
}
