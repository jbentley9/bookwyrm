import '@mantine/core/styles.css';
import type { Route } from "./+types/home";
import { Container } from "@mantine/core";
import { useLoaderData } from "react-router";
import { getUser } from "../utils/auth-user";
import prisma from "../db";
import type { Book, Review, User } from "@prisma/client";
import { HeroSection } from "../components/HeroSection";
import { FeaturedBooksSection } from "../components/FeaturedBooksSection";
import { RecentReviewsSection } from "../components/RecentReviewsSection";
import { UserFeaturesSection } from "../components/UserFeaturesSection";

type BookWithReview = Book & {
  reviews: (Review & {
    user: Pick<User, 'name'>;
  })[];
};

type ReviewWithUserAndBook = Review & {
  user: Pick<User, 'name'>;
  book: Pick<Book, 'title'>;
};

export async function loader({ request }: Route.LoaderArgs) {
  const sessionUser = await getUser(request);
  let currentUser = null;

  if (sessionUser) {
    currentUser = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: { id: true, name: true, email: true }
    });
  }

  // Get featured books (for now, just get the latest 3)
  const featuredBooks = await prisma.book.findMany({
    take: 3,
    orderBy: { id: 'desc' },
    include: {
      reviews: {
        take: 1,
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    }
  });

  // Get recent reviews
  const recentReviews = await prisma.review.findMany({
    take: 4,
    orderBy: { id: 'desc' },
    include: {
      user: {
        select: { name: true }
      },
      book: {
        select: { title: true }
      }
    }
  });

  return { currentUser, featuredBooks, recentReviews };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home | BookWyrm" },
    { name: "description", content: "Welcome to BookWyrm - Your personal book review platform!" },
  ];
}

export default function Home() {
  const { currentUser, featuredBooks, recentReviews } = useLoaderData<typeof loader>();

  return (
    <Container size="lg" py="xl">
      <HeroSection currentUser={currentUser} />
      <FeaturedBooksSection books={featuredBooks} />
      <RecentReviewsSection reviews={recentReviews} />
      {currentUser && <UserFeaturesSection currentUser={currentUser} />}
    </Container>
  );
}
