import prisma from "../db";
import type { Route } from "./+types/books";
import { AgGridReact } from "ag-grid-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef, ICellRendererParams, GridApi } from "ag-grid-community";
import { useLoaderData, useActionData } from "react-router";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';

ModuleRegistry.registerModules([AllCommunityModule]);

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
};

type LoaderData = {
  books: Book[];
};

// Loader function to fetch all books
export async function loader() {
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
      const bookId = formData.get("bookId") as string;
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;
      const isbn = formData.get("isbn") as string;
      
      await prisma.book.update({
        where: { id: bookId },
        data: { title, author, isbn }
      });
      break;
    }
    
    case "delete": {
      const bookId = formData.get("bookId") as string;
      
      try {
        await prisma.book.delete({
          where: { id: bookId }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to delete book:', error);
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
    formData.append('bookId', data.id);
    
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
        console.error('Failed to delete book:', await response.text());
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
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
function UpdateButtonRenderer(props: ICellRendererParams<Book>) {
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
      colKey: 'title'
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Books | BookWyrm" },
    { name: "description", content: "Manage and view all books in the BookWyrm system." },
  ];
}

export default function BooksGrid() {
  console.time('Component Render');
  const { books } = useLoaderData<typeof loader>();
  console.timeEnd('Component Render');

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

  const colDefs = useMemo<ColDef<Book>[]>(() => [
    { 
      field: 'title', 
      headerName: 'Title',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
    },
    { 
      field: 'author', 
      headerName: 'Author',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
    },
    { 
      field: 'isbn', 
      headerName: 'ISBN',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
    },
    { 
      headerName: 'Actions',
      width: 160,
      cellRenderer: (params: ICellRendererParams<Book>) => (
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newISBN, setNewISBN] = useState('');
  const [quickFilterText, setQuickFilterText] = useState('');

  // Memoize the grid ready handler
  const onGridReady = useCallback((params: any) => {
    console.time('Grid Ready');
    setGridApi(params.api);
    console.timeEnd('Grid Ready');
  }, []);

  // Memoize the cell value changed handler
  const onCellValueChanged = useCallback((params: any) => {
    const formData = new FormData();
    formData.append('actionType', 'update');
    formData.append('bookId', params.data.id);
    formData.append('title', params.data.title);
    formData.append('author', params.data.author);
    formData.append('isbn', params.data.isbn || '');
    
    fetch(window.location.href, {
      method: 'POST',
      body: formData
    });
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

    const tempId = uuidv4();
    const tempRow = {
      id: tempId,
      title: newTitle,
      author: newAuthor,
      isbn: newISBN || null
    };

    gridApi?.applyTransaction({
      add: [tempRow],
      addIndex: 0
    });

    const formData = new FormData();
    formData.append('actionType', 'create');
    formData.append('id', tempId);
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
        gridApi?.applyTransaction({
          remove: [tempRow]
        });
        console.error('Failed to create book:', await response.text());
      }
    } catch (error) {
      console.error('Failed to create book:', error);
      gridApi?.applyTransaction({
        remove: [tempRow]
      });
    }
  };

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
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Manage Books</h2>
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
            Add Book
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
          rowData={books}
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
              <h3 style={{ margin: 0, fontSize: '20px' }}>Add New Book</h3>
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
                <label style={{ display: 'block', marginBottom: '8px' }}>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>ISBN</label>
                <input
                  type="text"
                  value={newISBN}
                  onChange={(e) => setNewISBN(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  placeholder="Enter ISBN (optional)"
                />
              </div>

              <button
                onClick={handleAddBook}
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
                Add Book
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 