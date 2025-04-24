import prisma from "../db";
import type { Route } from "./+types/reviews.grid";
import { useState, useCallback, useMemo } from "react";
import type { ColDef, ICellRendererParams, GridReadyEvent, GridApi } from "ag-grid-community";
import { useLoaderData } from "react-router";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';
import { DataGrid } from "../components/DataGrid";
import styles from '../components/DataGrid.module.css';
import { getUser } from "../utils/auth-user";
import { redirect } from "react-router";

type Review = {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  book?: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    name: string;
  };
};

// Loader function to fetch all reviews with related data
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  
  if (!user || !user.isAdmin) {
    return redirect("/login");
  }

  const [reviews, books, users] = await Promise.all([
    prisma.review.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        book: true,
        user: true
      }
    }),
    prisma.book.findMany({
      orderBy: {
        title: 'asc'
      }
    }),
    prisma.user.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  ]);
  return { reviews, books, users };
}

// Action function to handle operations
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  
  switch (actionType) {
    case "create": {
      const id = formData.get("id") as string;
      const bookId = formData.get("bookId") as string;
      const userId = formData.get("userId") as string;
      const rating = parseInt(formData.get("rating") as string);
      const review = formData.get("review") as string;
      
      try {
        await prisma.review.create({
          data: {
            id,
            bookId,
            userId,
            rating,
            review
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
      const id = formData.get("id") as string;
      const rating = parseInt(formData.get("rating") as string);
      const review = formData.get("review") as string;
      
      try {
        await prisma.review.update({
          where: { id },
          data: { rating, review }
        });
        
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
      const id = formData.get("id") as string;
      await prisma.review.delete({
        where: { id }
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Invalid action type' }), {
    status: 400,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Custom header component for editable columns
function EditableHeaderRenderer(props: any) {
  return (
    <div className={styles.editableHeader}>
      <IconPencil size={14} style={{ marginRight: '4px' }} />
      <span>{props.displayName}</span>
    </div>
  );
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
    formData.append('id', data.id);
    
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
      className={styles.iconButton}
      title="Delete"
    >
      <IconTrash size={16} />
    </button>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Reviews | BookWyrm" },
    { name: "description", content: "Manage and view all reviews in the BookWyrm system." },
  ];
}

export default function ReviewsGrid() {
  const { reviews, books, users } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookId, setNewBookId] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newRating, setNewRating] = useState('');
  const [newReview, setNewReview] = useState('');
  const [gridApi, setGridApi] = useState<any>(null);

  const colDefs = useMemo<ColDef<Review>[]>(() => [
    { 
      width: 32,
      maxWidth: 32,
      cellRenderer: (params: ICellRendererParams<Review>) => (
        <div className={styles.actions}>
          <DeleteButtonRenderer {...params} />
        </div>
      ),
      sortable: false,
      filter: false,
      editable: false,
      suppressSizeToFit: true,
      suppressAutoSize: true,
      headerName: '',
      resizable: false
    },
    { 
      field: 'book.title', 
      headerName: 'Book',
      editable: false,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'user.name', 
      headerName: 'User',
      editable: false,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'rating', 
      headerName: 'Rating',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['equals'],
        defaultOption: 'equals',
      },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [1, 2, 3, 4, 5]
      },
      valueFormatter: (params) => params.value?.toString() || '',
      headerComponent: EditableHeaderRenderer,
      width: 85,
      maxWidth: 120,
      suppressSizeToFit: true,
      suppressAutoSize: true
    },
    { 
      field: 'review', 
      headerName: 'Review',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      headerComponent: EditableHeaderRenderer,
      flex: 2,
      minWidth: 200,
      wrapText: true,
      autoHeight: true
    }
  ], []);

  // Reset form function
  const resetForm = () => {
    setNewBookId('');
    setNewUserId('');
    setNewRating('');
    setNewReview('');
  };

  // Handle adding new review
  const handleAddReview = async () => {
    if (!newBookId || !newUserId || !newRating || !newReview) {
      alert('Please fill in all required fields');
      return;
    }

    const id = uuidv4();
    const selectedBook = books.find(book => book.id === newBookId);
    const selectedUser = users.find(user => user.id === newUserId);
    
    const newRow = {
      id,
      bookId: newBookId,
      userId: newUserId,
      rating: parseInt(newRating),
      review: newReview,
      createdAt: new Date(),
      updatedAt: new Date(),
      book: selectedBook,
      user: selectedUser
    };

    // Add the new review to the grid immediately
    gridApi?.applyTransaction({
      add: [newRow],
      addIndex: 0
    });

    const formData = new FormData();
    formData.append('actionType', 'create');
    formData.append('id', id);
    formData.append('bookId', newBookId);
    formData.append('userId', newUserId);
    formData.append('rating', newRating);
    formData.append('review', newReview);
    
    try {
      const response = await fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        resetForm();
        setIsModalOpen(false);
      } else {
        // Remove the row if the request fails
        gridApi?.applyTransaction({
          remove: [newRow]
        });
        console.error('Failed to create review:', await response.text());
      }
    } catch (error) {
      // Remove the row if there's an error
      gridApi?.applyTransaction({
        remove: [newRow]
      });
      console.error('Failed to create review:', error);
    }
  };

  const onCellValueChanged = useCallback((params: any) => {
    if (params.column.colId === 'rating' || params.column.colId === 'review') {
      const formData = new FormData();
      formData.append('actionType', 'update');
      formData.append('id', params.data.id);
      formData.append('rating', params.data.rating);
      formData.append('review', params.data.review);
      
      fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
    }
  }, []);

  return (
    <>
      <DataGrid
        title="Manage Reviews"
        data={reviews}
        columnDefs={colDefs}
        onAddClick={() => setIsModalOpen(true)}
        addButtonLabel="Add Review"
        onCellValueChanged={onCellValueChanged}
        onGridReady={(params: GridReadyEvent) => {
          setGridApi(params.api);
        }}
      />

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
                  value={newBookId}
                  onChange={(e) => setNewBookId(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Choose a book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Select User</label>
                <select
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Choose a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Rating</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Review</label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Write your review"
                  required
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
    </>
  );
} 