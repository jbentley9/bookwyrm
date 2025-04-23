import prisma from "../db";
import type { Route } from "./+types/reviews";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

ModuleRegistry.registerModules([AllCommunityModule]);

type Review = {
  id: string;
  rating: number;
  review: string;
  user: {
    name: string;
  };
  book: {
    title: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const reviews = await prisma.review.findMany({
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
  console.log('Reviews fetched:', reviews);
  return { reviews };
}

export default function ReviewsGrid({ loaderData }: { loaderData: { reviews: Review[] } }) {
  
  
  const [rowData] = useState(loaderData.reviews);
  console.log('rowData:', rowData);
  
  const [colDefs] = useState<ColDef<Review>[]>([
    { field: 'book.title' },
    { field: 'user.name' },
    { field: 'rating' },
    { field: 'review' }
  ]);

  console.log(colDefs);

  if (!loaderData.reviews || loaderData.reviews.length === 0) {
    return <div>No reviews to display</div>;
  }

  return (
    <div className="ag-theme-quartz" style={{ height: '500px', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={{
          sortable: true,
          filter: true
        }}
      />
    </div>
  );
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const _action = formData.get("_action");
  const reviewId = formData.get("reviewId");
  
  return null
}


