import { PrismaClient, UserTier } from '@prisma/client';
const db = new PrismaClient();

const books = [
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '978-0756404741' },
  { title: 'The Way of Kings', author: 'Brandon Sanderson', isbn: '978-0765326355' },
  { title: 'Dune', author: 'Frank Herbert', isbn: '978-0441172719' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0547928227' },
  { title: 'The Lies of Locke Lamora', author: 'Scott Lynch', isbn: '978-0553588941' },
  { title: 'The Fifth Season', author: 'N.K. Jemisin', isbn: '978-0316229296' },
  { title: 'The Blade Itself', author: 'Joe Abercrombie', isbn: '978-0575079798' },
  { title: 'The Eye of the World', author: 'Robert Jordan', isbn: '978-0812511819' },
  { title: 'The Black Prism', author: 'Brent Weeks', isbn: '978-0316075557' },
  { title: 'The Poppy War', author: 'R.F. Kuang', isbn: '978-0062662569' }
];

const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', tier: UserTier.BASIC },
  { name: 'Bob Smith', email: 'bob@example.com', tier: UserTier.PREMIER },
  { name: 'Charlie Brown', email: 'charlie@example.com', tier: UserTier.BASIC },
  { name: 'Diana Prince', email: 'diana@example.com', tier: UserTier.PREMIER },
  { name: 'Ethan Hunt', email: 'ethan@example.com', tier: UserTier.BASIC },
  { name: 'Fiona Green', email: 'fiona@example.com', tier: UserTier.PREMIER },
  { name: 'George Wilson', email: 'george@example.com', tier: UserTier.BASIC },
  { name: 'Hannah Baker', email: 'hannah@example.com', tier: UserTier.PREMIER },
  { name: 'Ian Cooper', email: 'ian@example.com', tier: UserTier.BASIC },
  { name: 'Jane Doe', email: 'jane@example.com', tier: UserTier.PREMIER }
];

const reviewTemplates = [
  'An absolute masterpiece that kept me hooked from start to finish.',
  'The world-building is incredible, but the pacing could be better.',
  'One of the best books I\'ve read this year!',
  'The characters are well-developed and relatable.',
  'The plot twists were unexpected and brilliant.',
  'A bit slow in the beginning, but worth sticking with.',
  'The writing style is beautiful and immersive.',
  'I couldn\'t put it down once I started reading.',
  'The ending was a bit disappointing, but overall a good read.',
  'The magic system is unique and fascinating.',
  'The dialogue feels natural and engaging.',
  'Some parts dragged on, but the climax was worth it.',
  'The protagonist\'s journey is inspiring.',
  'The world feels alive and detailed.',
  'The political intrigue adds depth to the story.',
  'The action scenes are well-written and exciting.',
  'The romance subplot felt unnecessary.',
  'The themes are thought-provoking and relevant.',
  'The prose is elegant and descriptive.',
  'The book exceeded all my expectations.'
];

async function seed() {
  // Check if the database is already seeded
  const usersExists = await db.user.findFirst();
  if (usersExists) {
    console.log('Database already seeded. Skipping seeding process.');
    return;
  }

  console.log('Seeding database...');
  // Create users
  const createdUsers = await Promise.all(
    users.map(user => 
      db.user.create({
        data: {
          ...user,
          password: 'password123', // In production, this would be hashed
        },
      })
    )
  );

  // Create books
  const createdBooks = await Promise.all(
    books.map(book => db.book.create({ data: book }))
  );

  // Create reviews
  const reviews = [];
  for (let i = 0; i < 50; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const book = createdBooks[Math.floor(Math.random() * createdBooks.length)];
    const rating = Math.floor(Math.random() * 5) + 1;
    const reviewText = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
    
    reviews.push(
      db.review.create({
        data: {
          rating,
          review: reviewText,
          userId: user.id,
          bookId: book.id,
        },
      })
    );
  }

  await Promise.all(reviews);

  console.log('Database has been seeded with 10 users, 10 books, and 50 reviews.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  }); 