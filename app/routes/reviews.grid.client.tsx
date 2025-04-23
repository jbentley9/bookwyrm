import { AgGridReact } from "ag-grid-react";
import reviewsGrid from "./reviews.grid";

export default function reviewsGridClient() {
  return (
    <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
      <h1>Reviews</h1>
      <AgGridReact
        rowData={reviewsGrid.reviews}
        columnDefs={reviewsGrid.columnDefs}
      />
    </div>
}