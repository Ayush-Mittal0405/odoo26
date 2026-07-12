const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {

  // ======================
  // Departments
  // ======================

  const manufacturing =
    await prisma.department.upsert({
      where: {
        code: "MFG"
      },
      update: {},
      create: {
        name: "Manufacturing",
        code: "MFG"
      }
    });

  const logistics =
    await prisma.department.upsert({
      where: {
        code: "LOG"
      },
      update: {},
      create: {
        name: "Logistics",
        code: "LOG"
      }
    });

  const corporate =
    await prisma.department.upsert({
      where: {
        code: "COR"
      },
      update: {},
      create: {
        name: "Corporate",
        code: "COR"
      }
    });

  // ======================
  // Categories
  // ======================

  await prisma.category.createMany({
    data: [
      {
        name: "Tree Plantation",
        type: "CSR_ACTIVITY"
      },
      {
        name: "Blood Donation",
        type: "CSR_ACTIVITY"
      },
      {
        name: "Green Commute",
        type: "CHALLENGE"
      }
    ],
    skipDuplicates: true
  });

  // ======================
  // Emission Factors
  // ======================

  await prisma.emissionFactor.createMany({
    data: [
      {
        activityType: "Diesel",
        unit: "Liter",
        co2PerUnit: 2.68,
        effectiveDate: new Date("2024-01-01")
      },
      {
        activityType: "Electricity",
        unit: "kWh",
        co2PerUnit: 0.82,
        effectiveDate: new Date("2024-01-01")
      },
      {
        activityType: "Petrol",
        unit: "Liter",
        co2PerUnit: 2.31,
        effectiveDate: new Date("2024-01-01")
      }
    ],
    skipDuplicates: true
  });

  // ======================
  // Admin Employee
  // ======================

  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.employee.upsert({
    where: {
      email: "admin@gmail.com"
    },

    update: {
      password: hashedPassword
    },

    create: {
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      departmentId: manufacturing.id,
      xpTotal: 500,
      pointsBalance: 500
    }
  });

  console.log(
    "✅ Seed inserted successfully"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });