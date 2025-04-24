import prisma from "../db";
import type { Route } from "./+types/reviews";
import { AgGridReact } from "ag-grid-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef, ICellRendererParams, ICellEditorParams, GridApi } from "ag-grid-community";
import { useLoaderData, useActionData, Form, useLocation } from "react-router";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';

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
  try {
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        review: true,
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true
      }
    });

    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true
      }
    });

    return { reviews, users, books };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { reviews: [], users: [], books: [] };
  }
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
        const createFormData = new FormData();
        createFormData.append("bookId", bookId);
        createFormData.append("userId", userId);
        createFormData.append("rating", rating.toString());
        createFormData.append("review", review);

        const response = await fetch("/api/reviews", {
          method: "POST",
          body: createFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to create review");
        }

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
      
      try {
        const updateFormData = new FormData();
        if (rating) updateFormData.append("rating", rating.toString());
        if (review) updateFormData.append("review", review);

        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: "PUT",
          body: updateFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to update review");
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to update review:', error);
        return new Response(JSON.stringify({ error: 'Failed to update review' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    case "delete": {
      const reviewId = formData.get("reviewId") as string;
      
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete review");
        }

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
      style={{
        background: 'transparent',
        color: '#ff4444',
        border: '1px solid #ff4444',
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        transition: 'all 0.2s ease',
        height: '28px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#ff4444';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#ff4444';
      }}
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
    const onCellEditingStarted = (event: any) => {
      if (event.node === props.node) {
        setIsEditing(true);
      }
    };

    const onCellEditingStopped = (event: any) => {
      if (event.node === props.node) {
        const isStillEditing = gridApi?.getEditingCells().some(
          cell => cell.rowIndex === props.node.rowIndex
        );
        if (!isStillEditing) {
          setIsEditing(false);
        }
      }
    };

    gridApi?.addEventListener('cellEditingStarted', onCellEditingStarted);
    gridApi?.addEventListener('cellEditingStopped', onCellEditingStopped);

    return () => {
      gridApi?.removeEventListener('cellEditingStarted', onCellEditingStarted);
      gridApi?.removeEventListener('cellEditingStopped', onCellEditingStopped);
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
      style={{
        background: 'transparent',
        color: buttonColor,
        border: `1px solid ${buttonColor}`,
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        transition: 'all 0.2s ease',
        height: '28px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = buttonColor;
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = buttonColor;
      }}
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
      width: 160,
      cellRenderer: (params: ICellRendererParams<Review>) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <UpdateButtonRenderer {...params} />
          <DeleteButtonRenderer {...params} />
        </div>
      ),
      sortable: false,
      filter: false,
      editable: false
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
    <div style={{ 
      height: '100vh',
      width: '100%',
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Manage Reviews</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search all columns..."
            value={quickFilterText}
            onChange={(e) => {
              setQuickFilterText(e.target.value);
              gridApi?.setQuickFilter(e.target.value);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              width: '200px'
            }}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <IconPlus size={20} />
            Add Review
          </button>
        </div>
      </div>

      <div className="ag-theme-alpine" style={{ 
        flex: 1,
        minHeight: 0,
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
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
          // Theme configuration
          theme="legacy"
          // Modern performance settings
          cellSelection={false}
          loading={false}
          // Performance optimizations
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
          // Optimize rendering
          rowBuffer={20}
          maxBlocksInCache={10}
          // Disable unnecessary animations
          suppressRowHoverHighlight={true}
          suppressCellFocus={true}
          enableCellTextSelection={true}
          onFirstDataRendered={() => {
          }}
        />
      </div>

      {isModalOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            }}
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
              width: '90%',
              maxWidth: '600px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Add New Review</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Select Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedBookId(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Choose a book</option>
                  {books.map((book: Book) => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserId(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Choose a user</option>
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRating(Number(e.target.value))}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Review</label>
                <input
                  type="text"
                  value={newReview}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReview(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  placeholder="Write your review"
                />
              </div>

              <button
                onClick={handleAddReview}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  width: '100%'
                }}
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


