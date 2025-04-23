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

type LoaderData = {
  reviews: Review[];
  users: { id: string; name: string; }[];
  books: { id: string; title: string; }[];
};

// Loader function to fetch all reviews
export async function loader({ request }: Route.LoaderArgs) {
  console.time('Total Loader Time');
  
  console.time('Fetch Reviews');
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
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  console.timeEnd('Fetch Reviews');

  console.time('Fetch Users');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    }
  });
  console.timeEnd('Fetch Users');

  console.time('Fetch Books');
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
    }
  });
  console.timeEnd('Fetch Books');

  console.timeEnd('Total Loader Time');
  
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
        // Remove the row immediately from the grid
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
        background: 'none',
        color: '#ff4444',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        marginRight: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <IconTrash size={20} />
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

  return (
    <button 
      onClick={isEditing ? handleSave : handleEdit}
      style={{
        background: 'none',
        color: isEditing ? '#4CAF50' : '#2196F3',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <IconPencil size={20} />
    </button>
  );
}

export default function ReviewsGrid() {
  console.time('Component Render');
  const { reviews, users, books } = useLoaderData<typeof loader>();
  console.timeEnd('Component Render');

  // Memoize the column definitions to prevent re-renders
  const colDefs = useMemo<ColDef<Review>[]>(() => [
    { 
      field: 'book.title', 
      headerName: 'Book',
      flex: 1,
      minWidth: 200,
      editable: false
    },
    { 
      field: 'user.name', 
      headerName: 'User',
      flex: 1,
      minWidth: 150,
      editable: false
    },
    { 
      field: 'rating', 
      headerName: 'Rating',
      width: 100,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 1,
        max: 5
      }
    },
    { 
      field: 'review', 
      headerName: 'Review',
      flex: 2,
      minWidth: 300,
      maxWidth: 800,
      autoHeight: true,
      wrapText: true,
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorParams: {
        maxLength: 1000,
        rows: 10,
        cols: 50
      }
    },
    { 
      headerName: 'Actions',
      width: 100,
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

  // Memoize the grid ready handler
  const onGridReady = useCallback((params: any) => {
    console.time('Grid Ready');
    setGridApi(params.api);
    console.timeEnd('Grid Ready');
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
    console.time('First Data Rendered');
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
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Book Reviews</h2>
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

      <div className="ag-theme-alpine" style={{ 
        flex: 1,
        minHeight: 0,
        width: '100%'
      }}>
        <AgGridReact
          ref={gridRef}
          rowData={reviews}
          columnDefs={colDefs}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            editable: false
          }}
          domLayout="normal"
          animateRows={false}
          rowHeight={80}
          onCellValueChanged={onCellValueChanged}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          // Theme configuration
          theme="legacy"
          // Modern performance settings
          rowSelection={{ mode: 'singleRow' }}
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
          onFirstDataRendered={() => {
            console.timeEnd('First Data Rendered');
            console.time('Grid Initialization Complete');
            console.timeEnd('Grid Initialization Complete');
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


