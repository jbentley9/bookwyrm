/**
 * Admin books management page.
 * Provides a grid interface for managing the book catalog.
 * Includes CRUD operations for books.
 */
import prisma from "../db";
import type { Route } from "./+types/books.grid";
import { useState, useCallback, useMemo } from "react";
import type { ColDef, ICellRendererParams, GridReadyEvent } from "ag-grid-community";
import { useLoaderData } from "react-router";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';
import { DataGrid } from "../components/DataGrid";
import styles from '../app.module.css';
import { getUser } from "../utils/auth-user";
import { redirect } from "react-router";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
};

// Loader function to fetch all books
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  
  if (!user || !user.isAdmin) {
    return redirect("/login");
  }

  const books = await prisma.book.findMany({
    orderBy: {
      title: 'asc'
    }
  });
  return { books };
}

// Action function to handle operations
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  
  switch (actionType) {
    case "create": {
      const id = formData.get("id") as string;
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;
      const isbn = formData.get("isbn") as string;
      
      try {
        await prisma.book.create({
          data: {
            id,
            title,
            author,
            isbn
          }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to create book:', error);
        return new Response(JSON.stringify({ error: 'Failed to create book' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    case "update": {
      const id = formData.get("id") as string;
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;
      const isbn = formData.get("isbn") as string;
      
      try {
        await prisma.book.update({
          where: { id },
          data: { title, author, isbn }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to update book:', error);
        return new Response(JSON.stringify({ error: 'Failed to update book' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    case "delete": {
      const id = formData.get("id") as string;
      
      try {
        await prisma.book.delete({
          where: { id }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to delete book:', error);
        // Check for Prisma's foreign key constraint error
        if (error instanceof Error && 
            (error.message.includes('Review_bookId_fkey') || 
             error.message.includes('Foreign key constraint violated'))) {
          return new Response(JSON.stringify({ 
            error: 'Cannot delete book because it has associated reviews. Please delete the reviews first.' 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
        return new Response(JSON.stringify({ error: 'Failed to delete book' }), {
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
function DeleteButtonRenderer(props: ICellRendererParams<Book>) {
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
        const errorData = await response.json();
        // Show error notification
        const notification = document.createElement('div');
        notification.className = styles.errorNotification;
        notification.textContent = errorData.error || 'Failed to delete book';
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
          notification.remove();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = styles.errorNotification;
      notification.textContent = 'Failed to delete book';
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
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

// Custom header component for editable columns
function EditableHeaderRenderer(props: any) {
  return (
    <div className={styles.editableHeader}>
      <IconPencil size={14} style={{ marginRight: '4px' }} />
      <span>{props.displayName}</span>
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Books | BookWyrm" },
    { name: "description", content: "Manage and view all books in the BookWyrm system." },
  ];
}

export default function BooksGrid() {
  const { books } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newISBN, setNewISBN] = useState('');
  const [gridApi, setGridApi] = useState<any>(null);

  const colDefs = useMemo<ColDef<Book>[]>(() => [
    { 
      width: 32,
      maxWidth: 32,
      cellRenderer: (params: ICellRendererParams<Book>) => (
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
      field: 'title', 
      headerName: 'Title',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      headerComponent: EditableHeaderRenderer
    },
    { 
      field: 'author', 
      headerName: 'Author',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      headerComponent: EditableHeaderRenderer
    },
    { 
      field: 'isbn', 
      headerName: 'ISBN',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      headerComponent: EditableHeaderRenderer
    }
  ], []);

  const handleGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  // Reset form function
  const resetForm = () => {
    setNewTitle('');
    setNewAuthor('');
    setNewISBN('');
  };

  // Handle adding new book
  const handleAddBook = async () => {
    if (!newTitle || !newAuthor) {
      alert('Please fill in at least the title and author');
      return;
    }

    const id = uuidv4();
    const newRow = {
      id,
      title: newTitle,
      author: newAuthor,
      isbn: newISBN || null
    };

    // Add the new book to the grid immediately
    gridApi?.applyTransaction({
      add: [newRow],
      addIndex: 0
    });

    const formData = new FormData();
    formData.append('actionType', 'create');
    formData.append('id', id);
    formData.append('title', newTitle);
    formData.append('author', newAuthor);
    formData.append('isbn', newISBN);
    
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
        console.error('Failed to create book:', await response.text());
      }
    } catch (error) {
      // Remove the row if there's an error
      gridApi?.applyTransaction({
        remove: [newRow]
      });
      console.error('Failed to create book:', error);
    }
  };

  const onCellValueChanged = useCallback((params: any) => {
    const formData = new FormData();
    formData.append('actionType', 'update');
    formData.append('id', params.data.id);
    formData.append('title', params.data.title);
    formData.append('author', params.data.author);
    formData.append('isbn', params.data.isbn || '');
    
    fetch(window.location.href, {
      method: 'POST',
      body: formData
    });
  }, []);

  return (
    <>
      <DataGrid
        title="Manage Books"
        data={books}
        columnDefs={colDefs}
        onAddClick={() => setIsModalOpen(true)}
        addButtonLabel="Add Book"
        onCellValueChanged={onCellValueChanged}
        onGridReady={handleGridReady}
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
              <h3 className={styles.modalTitle}>Add New Book</h3>
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
                <label className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div>
                <label className={styles.formLabel}>Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div>
                <label className={styles.formLabel}>ISBN</label>
                <input
                  type="text"
                  value={newISBN}
                  onChange={(e) => setNewISBN(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter ISBN (optional)"
                />
              </div>

              <button
                onClick={handleAddBook}
                className={styles.submitButton}
              >
                Add Book
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
} 