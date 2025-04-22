import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route("reviews", "routes/reviews.tsx"), 
    route("test", "routes/test.tsx"), 
    route("login", "routes/login.tsx"),
    route("reviews-grid", "routes/reviews.grid.tsx"),
    route("logout", "routes/logout.tsx"),
    //route("review-new", "routes/revewiew.new.tsx"),
] satisfies RouteConfig;
