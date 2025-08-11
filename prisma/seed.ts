import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.belief.create({
    data: {
      title: 'Starter belief',
      text: 'This is a starter belief.',
      topics: ['general'],
      author: 'System',
      category: 'General',
      certainty: 0.8,     // was "High"
      importance: 0.6,    // was "Medium"
    },
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
