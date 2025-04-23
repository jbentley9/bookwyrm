import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";

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

const testData: Review[] = [
  {
    id: '1',
    rating: 5,
    review: 'Test review 1',
    user: { name: 'Test User 1' },
    book: { title: 'Test Book 1' }
  },
  {
    id: '2',
    rating: 4,
    review: 'Test review 2',
    user: { name: 'Test User 2' },
    book: { title: 'Test Book 2' }
  }
];

export default function TestGrid() {
  const [rowData] = useState(testData);
  const [colDefs] = useState<ColDef<Review>[]>([
    { field: 'book.title' },
    { field: 'user.name' },
    { field: 'rating' },
    { field: 'review' }
  ]);

  return (
    <div className="ag-theme-quartz" style={{ height: '500px', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
      />
    </div>
  );
}