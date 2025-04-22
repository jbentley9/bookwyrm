import { type RouteConfig, index, route } from "@react-router/dev/routes";
import ProtectedRoutes from "./utils/ProtectedRoutes";

export default [
    index("routes/home.tsx"), 
    route("reviews", "routes/reviews.tsx"), 
    route("test", "routes/test.tsx"), 
    route("login", "routes/login.tsx"),
    route("protected", "utils/ProtectedRoutes.tsx", [
        route("reviews-grid", "routes/reviews.grid.tsx"),
        //route("review-new", "routes/revewiew.new.tsx"),
    ]),
] satisfies RouteConfig;
