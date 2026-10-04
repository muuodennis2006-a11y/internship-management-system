import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcrypt";
import { Pool } from "pg";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  console.log("Starting database seed...");
  const adminPassword = await bcrypt.hash("Admin@12345", 12);
  const supervisorPassword = await bcrypt.hash("Supervisor@12345", 12);
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@internship.local",
    },
    update: {
      name: "System Administrator",
      role: "ADMIN",
    },
    create: {
      name: "System Administrator",
      email: "admin@internship.local",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  const supervisor = await prisma.user.upsert({
    where: {
      email: "supervisor@internship.local",
    },
    update: {
      name: "Demo Supervisor",
      role: "SUPERVISOR",
    },
    create: {
      name: "Demo Supervisor",
      email: "supervisor@internship.local",
      passwordHash: supervisorPassword,
      role: "SUPERVISOR",
      supervisorProfile: {
        create: {
          department: "Information Technology",
          organization: "Internship Management Demo",
          phone: "+254700000000",
        },
      },
    },
  });
  await prisma.supervisorProfile.upsert({
    where: {
      userId: supervisor.id,
    },
    update: {
      department: "Information Technology",
      organization: "Internship Management Demo",
      phone: "+254700000000",
    },
    create: {
      userId: supervisor.id,
      department: "Information Technology",
      organization: "Internship Management Demo",
      phone: "+254700000000",
    },
  });
  const tracks = [
    {
      name: "Software Development",
      description: "Web, mobile and backend software development.",
    },
    {
      name: "Data & Analytics",
      description: "Data analysis, reporting, visualization and business intelligence.",
    },
    {
      name: "IT Support",
      description: "Technical support, systems administration and infrastructure.",
    },
    {
      name: "Cybersecurity",
      description: "Security operations, risk awareness and information security.",
    },
  ];
  for (const track of tracks) {
    await prisma.track.upsert({
      where: {
        name: track.name,
      },
      update: {
        description: track.description,
        active: true,
      },
      create: {
        name: track.name,
        description: track.description,
        active: true,
      },
    });
  }
  console.log("");
  console.log("======================================");
  console.log("DATABASE SEED COMPLETED");
  console.log("======================================");
  console.log(`Admin:       ${admin.email}`);
  console.log(`Supervisor:  ${supervisor.email}`);
  console.log(`Tracks:      ${tracks.length}`);
  console.log("======================================");
}
main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
