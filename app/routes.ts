import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route("all-reviews", "routes/reviews.tsx"), 
    route("test", "routes/test.tsx", { layout: "layouts/grid.layout.tsx" }), 
    route("login", "routes/login.tsx"),
    route("reviews-grid", "routes/reviews.grid.tsx"),
    route("logout", "routes/logout.tsx"),
    route("test-grid", "routes/test.grid.tsx"),
] satisfies RouteConfig;
