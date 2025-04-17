import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    "CONFERENCE",
    "WORKSHOP",
    "SEMINAR",
    "LECTURE",
    "OTHER",
  ] as const;
  for (const cat of categories) {
    await prisma.eventCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
  }

  console.log("✅ Event categories seeded");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
