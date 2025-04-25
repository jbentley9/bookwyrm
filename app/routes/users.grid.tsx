/**
 * Admin users management page.
 * Provides a grid interface for managing user accounts and permissions.
 * Includes CRUD operations for users and admin status management.
 */
import prisma from "../db";
import type { Route } from "./+types/users.grid";
import { useState, useCallback, useMemo } from "react";
import type { ColDef, ICellRendererParams, GridReadyEvent, GridApi } from "ag-grid-community";
import { useLoaderData } from "react-router";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from 'uuid';
import { DataGrid } from "../components/DataGrid";
import styles from '../app.module.css';
import { getUser } from "../utils/auth-user";
import { redirect } from "react-router";

type User = {
  id: string;
  name: string;
  email: string;
  tier: 'BASIC' | 'PREMIER';
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type LoaderData = {
  users: User[];
};

// Loader function to fetch all users
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  
  if (!user || !user.isAdmin) {
    return redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return { users };
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
        const errorData = await response.json();
        // Show error notification
        const notification = document.createElement('div');
        notification.className = styles.errorNotification;
        notification.textContent = errorData.error || 'Failed to delete user';
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
          notification.remove();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = styles.errorNotification;
      notification.textContent = 'Failed to delete user';
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Manage Users | BookWyrm" },
    { name: "description", content: "Manage and view all users in the BookWyrm system." },
  ];
}

// Action function to handle operations
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  
  switch (actionType) {
    case "create": {
      const id = formData.get("id") as string;
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const tier = formData.get("tier") as "BASIC" | "PREMIER";
      const isAdmin = formData.get("isAdmin") === "true";
      
      if (!name || !email) {
        return new Response(JSON.stringify({ error: 'Name and email are required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      try {
        await prisma.user.create({
          data: {
            id,
            name,
            email,
            tier,
            isAdmin,
            password: "changeme123" // Default password
          }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to create user:', error);
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    case "update": {
      const id = formData.get("id") as string;
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const tier = formData.get("tier") as "BASIC" | "PREMIER";
      const isAdmin = formData.get("isAdmin") === "true";
            
      try {
        await prisma.user.update({
          where: { id },
          data: { 
            name, 
            email, 
            tier, 
            isAdmin: Boolean(isAdmin)
          }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to update user:', error);
        return new Response(JSON.stringify({ error: 'Failed to update user' }), {
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
        await prisma.user.delete({
          where: { id }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to delete user:', error);
        // Check for Prisma's foreign key constraint error
        if (error instanceof Error && 
            (error.message.includes('Review_userId_fkey') || 
             error.message.includes('Foreign key constraint violated'))) {
          return new Response(JSON.stringify({ 
            error: 'Cannot delete user because they have associated reviews. Please delete their reviews first.' 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
        return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
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

export default function UsersGrid() {
  const { users } = useLoaderData<LoaderData>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
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
    },
    {
      field: 'isAdmin',
      headerName: 'Admin',
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
      headerComponent: EditableHeaderRenderer
    }
  ], []);

  // Reset form function
  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewIsAdmin(false);
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
      isAdmin: newIsAdmin,
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
    formData.append('isAdmin', newIsAdmin.toString());
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
    formData.append('isAdmin', params.data.isAdmin.toString());

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

              <div>
                <label className={styles.formLabel}>Admin</label>
                <input
                  type="checkbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  className={styles.formCheckbox}
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