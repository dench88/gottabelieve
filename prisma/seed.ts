
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.belief.count();
  if (count > 0) return;

  await prisma.belief.create({
    data: {
      title: "Example belief",
      text: "This is a sample belief text to get you started.",
      topics: ["example", "starter"],
      author: "System",
      category: "General",
      certainty: "High",
      importance: "Medium",
    },
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
