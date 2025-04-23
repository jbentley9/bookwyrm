import prisma from "../db";
import type { Route } from "./+types/api.reviews.$id";
import { data } from "react-router";

// GET /api/reviews/:id - Get a single review
export async function loader({ params }: Route.LoaderArgs) {
  const review = await prisma.review.findUnique({
    where: { id: params.id },
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

  if (!review) {
    return data({ error: "Review not found" }, { status: 404 });
  }

  return data(review);
}

// PUT /api/reviews/:id - Update a review
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "PUT") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const data = await request.json();
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        rating: data.rating,
        review: data.review
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

    return data(review);
  } catch (error) {
    return data({ error: "Failed to update review" }, { status: 400 });
  }
}

// DELETE /api/reviews/:id - Delete a review
export async function deleteAction({ params }: Route.ActionArgs) {
  try {
    await prisma.review.delete({
      where: { id: params.id }
    });
    return data({ success: true });
  } catch (error) {
    return data({ error: "Failed to delete review" }, { status: 400 });
  }
}

// This component won't render anything since it's an API route
export default function ReviewApi() {
  return null;
} 