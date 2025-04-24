import prisma from "../db";
import type { Route } from "./+types/books.api";

// GET /api/books - Get all books
// GET /api/books/:id - Get a single book
export async function loader({ params }: Route.LoaderArgs) {
  try {
    if (params.id) {
      // Get single book
      const book = await prisma.book.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
        },
      });

      if (!book) {
        return new Response(
          JSON.stringify({ error: "Book not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ book }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Get all books
      const books = await prisma.book.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
        },
        orderBy: {
          title: 'asc'
        },
      });

      return new Response(JSON.stringify({ books }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch books" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST /api/books - Create a new book
// PUT /api/books/:id - Update a book
// DELETE /api/books/:id - Delete a book
export async function action({ request, params }: Route.ActionArgs) {
  const method = request.method;
  const formData = await request.formData();

  switch (method) {
    case "POST": {
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;
      const isbn = formData.get("isbn") as string;

      if (!title || !author) {
        return new Response(
          JSON.stringify({ error: "Title and author are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const book = await prisma.book.create({
          data: { title, author, isbn },
        });

        return new Response(JSON.stringify({ book }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to create book" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    case "PUT": {
      const id = params.id || formData.get("id") as string;
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;
      const isbn = formData.get("isbn") as string;

      if (!id || !title || !author) {
        return new Response(
          JSON.stringify({ error: "ID, title, and author are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const book = await prisma.book.update({
          where: { id },
          data: { title, author, isbn },
        });

        return new Response(JSON.stringify({ book }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to update book" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    case "DELETE": {
      const id = params.id || formData.get("id") as string;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Book ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        await prisma.book.delete({
          where: { id },
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to delete book" }),
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