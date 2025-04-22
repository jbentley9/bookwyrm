import { PrismaClient, UserTier } from '@prisma/client';
const db = new PrismaClient();

async function seed() {
  // Clean the database
  await db.review.deleteMany();
  await db.book.deleteMany();
  await db.user.deleteMany();

  // Create users
  const user1 = await db.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123', // In production, this would be hashed
      tier: UserTier.BASIC,
    },
  });

  const user2 = await db.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123', // In production, this would be hashed
      tier: UserTier.PREMIER,
    },
  });

  // Create books
  const book1 = await db.book.create({
    data: {
      title: 'The Dragon\'s Path',
      author: 'Daniel Abraham',
      isbn: '978-0316129084',
    },
  });

  const book2 = await db.book.create({
    data: {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '978-0756404741',
    },
  });

  // Create reviews
  await db.review.create({
    data: {
      rating: 5,
      review: 'An amazing journey into a richly detailed world.',
      userId: user1.id,
      bookId: book1.id,
    },
  });

  await db.review.create({
    data: {
      rating: 4,
      review: 'Beautifully written, though the pacing was a bit slow at times.',
      userId: user2.id,
      bookId: book2.id,
    },
  });

  console.log('Database has been seeded. 🌱');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  }); 