import prisma from "../db";
import type { LoaderArgs, ActionArgs } from "./+types/api.reviews";

// GET /api/reviews - Get all reviews
export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const sort = url.searchParams.get("sort") || "createdAt";
  const order = url.searchParams.get("order") || "desc";
  
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    }),
    prisma.review.count()
  ]);

  return new Response(
    JSON.stringify({
      data: reviews,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// POST /api/reviews - Create a new review
export async function action({ request }: ActionArgs) {
  if (request.method === "POST") {
    const body = await request.json();
    const review = await prisma.review.create({
      data: {
        rating: body.rating,
        review: body.review,
        userId: body.userId,
        bookId: body.bookId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return new Response(
      JSON.stringify(review),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// This component won't render anything since it's an API route
export default function ApiReviews() {
  return null;
} 