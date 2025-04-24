import prisma from "../db";
import type { Route } from "./+types/users.grid";
import { useState, useCallback, useMemo } from "react";
import type { ColDef, ICellRendererParams, GridReadyEvent, GridApi } from "ag-grid-community";
import { useLoaderData } from "react-router";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';
import { DataGrid } from "../components/DataGrid";
import styles from '../components/DataGrid.module.css';

type User = {
  id: string;
  name: string;
  email: string;
  tier: 'BASIC' | 'PREMIER';
  createdAt: Date;
  updatedAt: Date;
};

// Loader function to fetch all users
export async function loader() {
  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc'
    }
  });
  return { users };
}

// Reuse the existing action
export { action } from './users.grid';

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
function DeleteButtonRenderer(props: ICellRendererParams<User>) {
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
        console.error('Failed to delete user:', await response.text());
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
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
    { title: "Manage Users | BookWyrm" },
    { name: "description", content: "Manage and view all users in the BookWyrm system." },
  ];
}

export default function UsersGridTest() {
  const { users } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const handleGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const colDefs = useMemo<ColDef<User>[]>(() => [
    { 
      width: 32,
      maxWidth: 32,
      cellRenderer: (params: ICellRendererParams<User>) => (
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
      field: 'name', 
      headerName: 'Name',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      headerComponent: EditableHeaderRenderer
    },
    { 
      field: 'email', 
      headerName: 'Email',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains',
      },
      headerComponent: EditableHeaderRenderer
    },
    { 
      field: 'tier', 
      headerName: 'Tier',
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['equals'],
        defaultOption: 'equals',
      },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['BASIC', 'PREMIER']
      },
      headerComponent: EditableHeaderRenderer
    }
  ], []);

  // Reset form function
  const resetForm = () => {
    setNewName('');
    setNewEmail('');
  };

  // Handle adding new user
  const handleAddUser = async () => {
    if (!newName || !newEmail) {
      alert('Please fill in all required fields');
      return;
    }

    const id = uuidv4();
    const newRow = {
      id,
      name: newName,
      email: newEmail,
      tier: 'BASIC',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the new user to the grid immediately
    gridApi?.applyTransaction({
      add: [newRow],
      addIndex: 0
    });

    const formData = new FormData();
    formData.append('actionType', 'create');
    formData.append('id', id);
    formData.append('name', newName);
    formData.append('email', newEmail);
    formData.append('tier', 'BASIC');
    
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
        console.error('Failed to create user:', await response.text());
      }
    } catch (error) {
      // Remove the row if there's an error
      gridApi?.applyTransaction({
        remove: [newRow]
      });
      console.error('Failed to create user:', error);
    }
  };

  const onCellValueChanged = useCallback((params: any) => {
    const formData = new FormData();
    formData.append('actionType', 'update');
    formData.append('id', params.data.id);
    formData.append('name', params.data.name);
    formData.append('email', params.data.email);
    formData.append('tier', params.data.tier);
    
    fetch(window.location.href, {
      method: 'POST',
      body: formData
    });
  }, []);

  return (
    <>
      <DataGrid
        title="Manage Users"
        data={users}
        columnDefs={colDefs}
        onAddClick={() => setIsModalOpen(true)}
        addButtonLabel="Add User"
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
              <h3 className={styles.modalTitle}>Add New User</h3>
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
                <label className={styles.formLabel}>Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter user name"
                  required
                />
              </div>

              <div>
                <label className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <button
                onClick={handleAddUser}
                className={styles.submitButton}
              >
                Add User
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
} 