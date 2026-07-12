import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Seed admin user ─────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pavitrarpan.org";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`✅ Admin user: ${admin.email} (id: ${admin.id})`);

  // ─── Seed default website content ────────────────
  const existingContent = await prisma.websiteContent.findFirst();

  if (!existingContent) {
    const content = await prisma.websiteContent.create({
      data: {
        about:
          "Pavitrarpan Foundation is a non-profit organization dedicated to creating a positive impact on society through environmental conservation, education, and community development initiatives. Founded with a vision to build a sustainable future, we work tirelessly across communities to plant trees, conduct cleanliness drives, educate underprivileged students, and empower volunteers.",
        mission:
          "To foster sustainable development through tree plantation, cleanliness drives, education, and community empowerment, creating a cleaner, greener, and more educated society for future generations.",
        vision:
          "A world where every community thrives in a clean environment with access to quality education, sustainable practices, and equal opportunities for growth and development.",
        goals:
          "Plant 10,000 trees by 2030.\nConduct regular cleanliness drives across urban and rural communities.\nProvide quality education support to 500+ underprivileged students.\nBuild a network of 1,000+ active volunteers.\nOrganize 100+ impactful events annually.",
      },
    });
    console.log(`✅ Website content created (id: ${content.id})`);
  } else {
    console.log(`⏭️  Website content already exists (id: ${existingContent.id})`);
  }

  // ─── Seed default statistics ─────────────────────
  const existingStats = await prisma.statistics.findFirst();

  if (!existingStats) {
    const stats = await prisma.statistics.create({
      data: {
        treesPlanted: 500,
        cleanlinessDrives: 25,
        volunteers: 200,
        studentsEducated: 150,
        eventsConducted: 50,
      },
    });
    console.log(`✅ Statistics created (id: ${stats.id})`);
  } else {
    console.log(`⏭️  Statistics already exist (id: ${existingStats.id})`);
  }

  // ─── Seed sample events ─────────────────────────
  const eventCount = await prisma.event.count();

  if (eventCount === 0) {
    const events = await prisma.event.createMany({
      data: [
        {
          title: "Tree Plantation Drive – Monsoon 2026",
          description:
            "Join us for a massive tree plantation drive this monsoon season. We aim to plant 500 saplings across the city to combat pollution and promote green cover.",
          date: new Date("2026-07-15"),
          time: "8:00 AM - 12:00 PM",
          venue: "City Central Park, Sector 21",
          status: "upcoming",
          featured: true,
        },
        {
          title: "Community Cleanliness Drive",
          description:
            "A cleanliness drive in partnership with the local municipal body. Volunteers will clean public spaces, drains, and roads to promote hygiene awareness.",
          date: new Date("2026-07-01"),
          time: "7:00 AM - 11:00 AM",
          venue: "Market Area, Sector 15",
          status: "upcoming",
          featured: false,
        },
        {
          title: "Education Workshop for Underprivileged Children",
          description:
            "A one-day workshop focused on basic computer literacy, English communication, and career guidance for underprivileged children aged 10-16.",
          date: new Date("2026-06-10"),
          time: "10:00 AM - 4:00 PM",
          venue: "Community Hall, Block C",
          status: "completed",
          featured: true,
        },
      ],
    });
    console.log(`✅ ${events.count} sample events created`);
  } else {
    console.log(`⏭️  Events already exist (count: ${eventCount})`);
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
