import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route("all-reviews", "routes/reviews.tsx"),
    route("login", "routes/login.tsx"),
    route("reviews-grid", "routes/reviews.grid.tsx"),
    route("logout", "routes/logout.tsx"),
    route("api/reviews", "routes/api.reviews.tsx"),
    route("api/reviews/:id", "routes/api.reviews.$id.tsx"),
] satisfies RouteConfig;
