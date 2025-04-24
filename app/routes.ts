import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route("all-reviews", "routes/reviews.tsx"),
    route("login", "routes/login.tsx"),
    route("reviews-grid", "routes/reviews.grid.tsx"),
    route("books-grid", "routes/books.grid.tsx"),
    route("users-grid", "routes/users.grid.tsx"),
    route("logout", "routes/logout.tsx"),
    route("api/books/:id?", "routes/books.api.tsx"),
    route("/api-test", "routes/api-test.tsx"),
    route("/api/reviews/:id?", "routes/reviews.api.tsx"),

] satisfies RouteConfig;
