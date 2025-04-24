import prisma from "../db";
import type { Route } from "./+types/reviews.grid";
import { AgGridReact } from "ag-grid-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef, ICellRendererParams, ICellEditorParams, GridApi } from "ag-grid-community";
import { useLoaderData, useActionData, Form, useLocation } from "react-router";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';
import styles from './reviews.grid.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

type User = {
  id: string;
  name: string;
};

type Book = {
  id: string;
  title: string;
};

type Review = {
  id: string;
  rating: number;
  review: string;
  user: {
    id: string;
    name: string;
  };
  book: {
    id: string;
    title: string;
  };
};

// Loader function to fetch all reviews
export async function loader() {
  const reviews = await prisma.review.findMany({
    include: {
      user: true,
      book: true,
    },
    orderBy: [
      { user: { name: 'asc' } },
      { book: { title: 'asc' } }
    ],
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    }
  });

  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
    }
  });

  return { reviews, users, books };
}

// Action function to handle operations
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  
  switch (actionType) {
    case "create": {
      const id = formData.get("id") as string;
      const rating = Number(formData.get("rating"));
      const review = formData.get("review") as string;
      const userId = formData.get("userId") as string;
      const bookId = formData.get("bookId") as string;
      
      if (!userId || !bookId) {
        return new Response(JSON.stringify({ error: 'User and book are required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      try {
        const newReview = await prisma.review.create({
      data: {
            id,
            rating,
            review,
            userId,
            bookId
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
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
        
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to create review:', error);
        return new Response(JSON.stringify({ error: 'Failed to create review' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    case "update": {
      const reviewId = formData.get("reviewId") as string;
      const rating = Number(formData.get("rating"));
      const review = formData.get("review") as string;
      
      await prisma.review.update({
        where: { id: reviewId },
        data: { rating, review }
      });
      break;
    }
    
    case "delete": {
      const reviewId = formData.get("reviewId") as string;
      
      try {
        await prisma.review.delete({
          where: { id: reviewId }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to delete review:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete review' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
  }
  
  return new Response(JSON.stringify({ error: 'Invalid action type' }), {
    status: 400,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Custom cell renderer for delete button
function DeleteButtonRenderer(props: ICellRendererParams<Review>) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const data = props.data;
    if (!data) return;
    
    const formData = new FormData();
    formData.append('actionType', 'delete');
    formData.append('reviewId', data.id);
    
    try {
      const response = await fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        props.api?.applyTransaction({
          remove: [data]
        });
      } else {
        console.error('Failed to delete review:', await response.text());
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (!props.data) return null;

  return (
    <button 
      onClick={handleDelete}
      className={styles.deleteButton}
    >
      <IconTrash size={16} />
      Delete
    </button>
  );
}

// Custom cell renderer for update button
function UpdateButtonRenderer(props: ICellRendererParams<Review>) {
  const [isEditing, setIsEditing] = useState(false);
  const gridApi = props.api;

  useEffect(() => {
    if (!gridApi) return;

    const onCellEditingStarted = (event: any) => {
      if (event.node === props.node) {
        setIsEditing(true);
      }
    };

    const onCellEditingStopped = (event: any) => {
      if (event.node === props.node) {
        setIsEditing(false);
      }
    };

    gridApi.addEventListener('cellEditingStarted', onCellEditingStarted);
    gridApi.addEventListener('cellEditingStopped', onCellEditingStopped);

    return () => {
      if (!gridApi.isDestroyed()) {
        gridApi.removeEventListener('cellEditingStarted', onCellEditingStarted);
        gridApi.removeEventListener('cellEditingStopped', onCellEditingStopped);
      }
    };
  }, [gridApi, props.node]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    gridApi?.startEditingCell({
      rowIndex: props.node.rowIndex!,
      colKey: 'rating'
    });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    gridApi?.stopEditing();
    setIsEditing(false);
  };

  const buttonColor = isEditing ? '#4CAF50' : '#228be6';

  return (
    <button 
      onClick={isEditing ? handleSave : handleEdit}
      className={styles.updateButton}
    >
      <IconPencil size={16} />
      {isEditing ? 'Save' : 'Edit'}
    </button>
  );
}

// Add custom CSS styles for AG Grid
const customGridStyles = `
  .ag-theme-alpine {
    --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --ag-font-size: 14px;
    --ag-border-radius: 4px;
    --ag-cell-horizontal-padding: 12px;
    --ag-header-height: 48px;
    --ag-row-height: 48px;
    
    /* Colors to match Mantine */
    --ag-background-color: #ffffff;
    --ag-header-background-color: #f8f9fa;
    --ag-odd-row-background-color: #f8f9fa;
    --ag-header-foreground-color: #212529;
    --ag-foreground-color: #495057;
    --ag-border-color: #e9ecef;
    --ag-secondary-border-color: #e9ecef;
    --ag-row-border-color: #e9ecef;
    --ag-row-hover-color: #e9ecef;
    --ag-selected-row-background-color: rgba(51, 154, 240, 0.1);
    
    /* Input styling */
    --ag-input-border-color: #ced4da;
    --ag-input-border-radius: 4px;
    --ag-input-focus-border-color: #228be6;
    
    /* Disable alpine theme shadows */
    --ag-card-shadow: none;
    --ag-popup-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .ag-theme-alpine .ag-header-cell {
    font-weight: 600;
  }

  .ag-theme-alpine .ag-cell {
    line-height: 1.5;
    display: flex;
    align-items: center;
  }

  /* Special handling for the Actions column that contains buttons */
  .ag-theme-alpine .ag-cell:last-child > div {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .ag-theme-alpine .ag-paging-panel {
    border-top: 1px solid var(--ag-border-color);
    padding: 12px;
  }

  .ag-theme-alpine .ag-paging-button {
    border: 1px solid var(--ag-border-color);
    border-radius: 4px;
    padding: 4px 8px;
    margin: 0 2px;
  }

  .ag-theme-alpine .ag-paging-button:hover:not(.ag-disabled) {
    background-color: var(--ag-row-hover-color);
  }

  /* Ensure header cells are also vertically centered */
  .ag-theme-alpine .ag-header-cell-label {
    display: flex;
    align-items: center;
    height: 100%;
  }
`;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Reviews | BookWyrm" },
    { name: "description", content: "Manage and view all book reviews in the BookWyrm system." },
  ];
}

export default function ReviewsGrid() {
  
  const { reviews, users, books } = useLoaderData<typeof loader>();
  

  // Memoize the column definitions to prevent re-renders
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true,
    },
  }), []);

  const colDefs = useMemo<ColDef<Review>[]>(() => [
    { 
      field: 'book.title', 
      headerName: 'Book',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
    },
    { 
      field: 'user.name', 
      headerName: 'User',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
    },
    { 
      field: 'rating', 
      headerName: 'Rating',
      width: 100,
      editable: true,
      filter: 'agNumberColumnFilter',
      filterParams: {
        filterOptions: ['equals', 'lessThan', 'greaterThan'],
        defaultOption: 'equals',
      },
    },
    { 
      field: 'review', 
      headerName: 'Review',
      flex: 2,
      minWidth: 300,
      maxWidth: 800,
      editable: true,
      autoHeight: true,
      wrapText: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
    },
    { 
      headerName: 'Actions',
      width: 120,
      cellRenderer: (params: ICellRendererParams<Review>) => (
        <div className={styles.actions}>
          <UpdateButtonRenderer {...params} />
          <DeleteButtonRenderer {...params} />
        </div>
      ),
      sortable: false,
      filter: false,
      editable: false,
      suppressSizeToFit: true
    }
  ], []);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(1);
  const [newReview, setNewReview] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState('');

  // Memoize the grid ready handler
  const onGridReady = useCallback((params: any) => {
    ;
    setGridApi(params.api);
    
  }, []);

  // Memoize the cell value changed handler
  const onCellValueChanged = useCallback((params: any) => {
    if (params.column.colId === 'rating' || params.column.colId === 'review') {
      const formData = new FormData();
      formData.append('actionType', 'update');
      formData.append('reviewId', params.data.id);
      formData.append('rating', params.data.rating);
      formData.append('review', params.data.review);
      
      fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
    }
  }, []);

  // Reset form function
  const resetForm = () => {
    setSelectedUserId('');
    setSelectedBookId('');
    setNewRating(1);
    setNewReview('');
  };

  // Modified handleAddReview to close modal on success
  const handleAddReview = async () => {
    if (!selectedUserId || !selectedBookId) {
      alert('Please select both a user and a book');
      return;
    }

    const tempId = uuidv4();
    const tempRow = {
      id: tempId,
      rating: newRating,
      review: newReview,
      user: users.find((u: User) => u.id === selectedUserId),
      book: books.find((b: Book) => b.id === selectedBookId)
    };

    gridApi?.applyTransaction({
      add: [tempRow],
      addIndex: 0
    });

    const formData = new FormData();
    formData.append('actionType', 'create');
    formData.append('id', tempId);
    formData.append('rating', newRating.toString());
    formData.append('review', newReview);
    formData.append('userId', selectedUserId);
    formData.append('bookId', selectedBookId);
    
    try {
      const response = await fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        resetForm();
        setIsModalOpen(false);
      } else {
        gridApi?.applyTransaction({
          remove: [tempRow]
        });
        console.error('Failed to create review:', await response.text());
      }
    } catch (error) {
      console.error('Failed to create review:', error);
      gridApi?.applyTransaction({
        remove: [tempRow]
      });
    }
  };

  // Start First Data Rendered timer
  useEffect(() => {
    
  }, []);

  // Add style tag to the document
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = customGridStyles;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Reviews</h2>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search all columns..."
            value={quickFilterText}
            onChange={(e) => {
              setQuickFilterText(e.target.value);
              gridApi?.setQuickFilter(e.target.value);
            }}
            className={styles.searchInput}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.addButton}
          >
            <IconPlus size={20} />
            Add Review
          </button>
        </div>
      </div>

      <div className={`ag-theme-alpine ${styles.gridContainer}`}>
        <AgGridReact
          ref={gridRef}
          rowData={reviews}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
          animateRows={false}
          rowHeight={48}
          headerHeight={48}
          onCellValueChanged={onCellValueChanged}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          quickFilterText={quickFilterText}
          theme="legacy"
          cellSelection={false}
          loading={false}
          suppressColumnVirtualisation={true}
          suppressRowTransform={true}
          suppressContextMenu={true}
          suppressRowVirtualisation={true}
          suppressMovableColumns={true}
          suppressColumnMoveAnimation={true}
          suppressHorizontalScroll={false}
          suppressNoRowsOverlay={true}
          suppressFieldDotNotation={false}
          suppressMenuHide={true}
          suppressDragLeaveHidesColumns={true}
          rowBuffer={20}
          maxBlocksInCache={10}
          suppressRowHoverHighlight={true}
          suppressCellFocus={true}
          enableCellTextSelection={true}
          onFirstDataRendered={() => {}}
        />
      </div>

      {isModalOpen && (
        <>
          <div 
            className={styles.modalOverlay}
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Review</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div className={styles.formGroup}>
              <div>
                <label className={styles.formLabel}>Select Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedBookId(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Choose a book</option>
                  {books.map((book: Book) => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserId(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Choose a user</option>
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRating(Number(e.target.value))}
                  className={styles.formInput}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Review</label>
                <input
                  type="text"
                  value={newReview}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReview(e.target.value)}
                  className={styles.formInput}
                  placeholder="Write your review"
                />
              </div>

              <button
                onClick={handleAddReview}
                className={styles.submitButton}
              >
                Add Review
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


