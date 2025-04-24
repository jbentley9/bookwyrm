import { AgGridReact } from "ag-grid-react";
import { useState, useRef, useCallback, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef, GridReadyEvent, GridApi } from "ag-grid-community";
import { IconPlus } from "@tabler/icons-react";
import styles from './DataGrid.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface DataGridProps<T> {
  title: string;
  data: T[];
  columnDefs: ColDef<T>[];
  onAddClick?: () => void;
  addButtonLabel?: string;
  onCellValueChanged?: (params: any) => void;
  onGridReady?: (params: GridReadyEvent) => void;
}

export function DataGrid<T>({
  title,
  data,
  columnDefs,
  onAddClick,
  addButtonLabel = "Add",
  onCellValueChanged,
  onGridReady
}: DataGridProps<T>) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [searchText, setSearchText] = useState('');

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

  const onGridReadyInternal = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    if (onGridReady) {
      onGridReady(params);
    }
  }, [onGridReady]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search all columns..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              gridApi?.setFilterModel({
                quickFilter: e.target.value
              });
            }}
            className={styles.searchInput}
          />
          {onAddClick && (
            <button
              onClick={onAddClick}
              className={styles.addButton}
            >
              <IconPlus size={20} />
              {addButtonLabel}
            </button>
          )}
        </div>
      </div>

      <div className={`ag-theme-alpine ${styles.gridContainer}`}>
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
          animateRows={false}
          rowHeight={48}
          headerHeight={48}
          onCellValueChanged={onCellValueChanged}
          onGridReady={onGridReadyInternal}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          quickFilterText={searchText}
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
        />
      </div>
    </div>
  );
} 