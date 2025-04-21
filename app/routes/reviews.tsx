import type { Route } from "./+types/reviews";


//export async function loader({ request }: Route.LoaderArgs) {
  //const reviews = await getReviews();
  //return await reviews.json;
//}

//export async function action() {} 


export default function Review() {
  //return <p>{loaderData?.reviews.length}</p>;
  return <p>Reviews</p>;
}
