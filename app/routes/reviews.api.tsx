import prisma from "../db";
import type { RouteConfig } from "@react-router/dev/routes";

type Route = RouteConfig & {
  LoaderArgs: {
    params: {
      id?: string;
    };
  };
  ActionArgs: {
    request: Request;
    params: {
      id?: string;
    };
  };
};

// GET /api/reviews - Get all reviews
// GET /api/reviews/:id - Get a single review
export async function loader({ params }: Route["LoaderArgs"]) {
  try {
    if (params.id) {
      // Get single review
      const review = await prisma.review.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          bookId: true,
          userId: true,
          rating: true,
          review: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!review) {
        return new Response(
          JSON.stringify({ error: "Review not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ review }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Get all reviews
      const reviews = await prisma.review.findMany({
        select: {
          id: true,
          bookId: true,
          userId: true,
          rating: true,
          review: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
      });

      return new Response(JSON.stringify({ reviews }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reviews" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST /api/reviews - Create a new review
// PUT /api/reviews/:id - Update a review
// DELETE /api/reviews/:id - Delete a review
export async function action({ request, params }: Route["ActionArgs"]) {
  const method = request.method;
  const formData = await request.formData();

  switch (method) {
    case "POST": {
      const bookId = formData.get("bookId") as string;
      const userId = formData.get("userId") as string;
      const rating = formData.get("rating") as string;
      const review = formData.get("review") as string;

      if (!bookId || !userId || !rating || !review) {
        return new Response(
          JSON.stringify({ error: "Book ID, user ID, rating, and review text are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const newReview = await prisma.review.create({
          data: { 
            bookId, 
            userId, 
            rating: parseInt(rating), 
            review 
          },
        });

        return new Response(JSON.stringify({ review: newReview }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to create review" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    case "PUT": {
      const id = params.id || formData.get("id") as string;
      const rating = formData.get("rating") as string;
      const review = formData.get("review") as string;

      if (!id || (!rating && !review)) {
        return new Response(
          JSON.stringify({ error: "ID and at least one field (rating or review text) are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const updatedReview = await prisma.review.update({
          where: { id },
          data: { 
            ...(rating && { rating: parseInt(rating) }),
            ...(review && { review }),
          },
        });

        return new Response(JSON.stringify({ review: updatedReview }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to update review" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    case "DELETE": {
      const id = params.id || formData.get("id") as string;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Review ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        await prisma.review.delete({
          where: { id },
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to delete review" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    default:
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
  }
} 