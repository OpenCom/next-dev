// src/components/common/DataGridExportToolbar.tsx
import React from 'react';
import {
  GridToolbarContainer,
  useGridApiContext,
  gridPaginatedVisibleSortedGridRowIdsSelector,
  gridColumnDefinitionsSelector,
  gridVisibleColumnFieldsSelector,
  GridRowId,
  GridColDef,
  GridValidRowModel,
  GridToolbarExport,
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import Box from '@mui/material/Box';

import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';

export interface DataGridExportToolbarProps {
  /**
   * The base name for the exported files
   * @default "export"
   */
  fileName?: string;
  /**
   * Whether to export all rows or just the current page
   * @default false
   */
  exportAllRows?: boolean;
  /**
   * Custom title for the export button
   * @default "Export"
   */
  buttonText?: string;
  /**
   * Whether to show the email options
   * @default true
   */
  showEmailOptions?: boolean;
  /**
   * Custom email subject template
   * @default "Data Export - {fileName}"
   */
  emailSubjectTemplate?: string;
  /**
   * Custom email body template
   * @default "Hello,\n\nPlease find the data export attached.\n\n(Instructions: Please use the 'Export' menu to download the {format} file, then attach it to your email.)"
   */
  emailBodyTemplate?: string;
}

const ExportToolbar: React.FC<DataGridExportToolbarProps> = ({
  fileName = 'export',
  exportAllRows = false,
  showEmailOptions = true,
  emailSubjectTemplate = 'Data Export - {fileName}',
  emailBodyTemplate = 'Ecco i dati richiesti:\n\n{tableData}',
}) => {
  const apiRef = useGridApiContext();

  const getRowsToExport = (): GridValidRowModel[] => {
    const selectedRowIds = apiRef.current.getSelectedRows().keys();
    let rowIdsToExport: GridRowId[] = [];

    const hasSelectedRows = apiRef.current.getSelectedRows().size > 0;

    if (hasSelectedRows) {
      for (const id of selectedRowIds) {
        rowIdsToExport.push(id);
      }
    } else if (exportAllRows) {
      rowIdsToExport = Array.from(apiRef.current.getSortedRows().keys());
    } else {
      rowIdsToExport = gridPaginatedVisibleSortedGridRowIdsSelector(apiRef);
    }
    return rowIdsToExport.map(id => apiRef.current.getRow(id)).filter(row => row !== null) as GridValidRowModel[];
  };

  const getColumnsToExport = (): GridColDef[] => {
    const visibleFields = gridVisibleColumnFieldsSelector(apiRef);
    const allColumns = gridColumnDefinitionsSelector(apiRef);
    return allColumns.filter(
      (col) => col.field !== '__check__' && visibleFields.includes(col.field)
    );
  };

  const handleDownloadPdf = () => {
    const rows = getRowsToExport();
    const columns = getColumnsToExport();

    if (!rows.length) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF();
    const tableColumns = columns.map(col => col.headerName || col.field);
    const tableRows = rows.map(row => {
      return columns.map(colDef => {
        const value = row[colDef.field];
        if (colDef.type === 'number' && typeof value === 'number') {
          return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        }
        return value !== undefined && value !== null ? String(value) : '';
      });
    });

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
    });

    const suffix = rows.length !== apiRef.current.getRowsCount() && apiRef.current.getSelectedRows().size > 0 ? '_selected' : '';
    doc.save(`${fileName}${suffix}.pdf`);
  };

  const handleDownloadExcel = () => {
    const rows = getRowsToExport();
    const columns = getColumnsToExport();

    if (!rows.length) {
      alert("No data to export.");
      return;
    }

    const excelData = rows.map(row => {
      const rowData: { [key: string]: any } = {};
      columns.forEach(colDef => {
        const columnTitle = colDef.headerName || colDef.field;
        const value = row[colDef.field];
        if (colDef.type === 'number' && typeof value === 'number') {
          rowData[columnTitle] = new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        } else {
          rowData[columnTitle] = value !== undefined && value !== null ? value : '';
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    const suffix = rows.length !== apiRef.current.getRowsCount() && apiRef.current.getSelectedRows().size > 0 ? '_selected' : '';
    XLSX.writeFile(workbook, `${fileName}${suffix}.xlsx`);
  };

  const handleSendEmail = () => {
    const rows = getRowsToExport();
    const columns = getColumnsToExport();

    if (!rows.length) {
      alert("No data to export.");
      return;
    }

    // Generate markdown table
    const headers = columns.map(col => col.headerName || col.field);
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    
    const dataRows = rows.map(row => {
      const cells = columns.map(colDef => {
        const value = row[colDef.field];
        if (colDef.type === 'number' && typeof value === 'number') {
          return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        }
        return value !== undefined && value !== null ? String(value) : '';
      });
      return `| ${cells.join(' | ')} |`;
    });

    const tableText = [headerRow, separatorRow, ...dataRows].join('\n');
    
    const subject = emailSubjectTemplate.replace('{fileName}', fileName);
    const body = emailBodyTemplate.replace('{tableData}', tableText);

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <GridToolbarContainer>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          onClick={handleDownloadPdf}
          startIcon={<PictureAsPdfIcon />}
          size="small"
        >
          Scarica PDF
        </Button>
        <Button
          onClick={handleDownloadExcel}
          startIcon={<DescriptionIcon />}
          size="small"
        >
          Scarica Excel
        </Button>
        {showEmailOptions && (
          <>
            <Button
              onClick={() => handleSendEmail()}
              startIcon={<EmailIcon />}
              size="small"
            >
              Invia per e-mail
            </Button>
          </>
        )}
      </Box>
    </GridToolbarContainer>
  );
};

function DataGridExportToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
      <ExportToolbar 
        fileName="spese_report"
        exportAllRows={false}
        showEmailOptions={true}
      />
    </GridToolbarContainer>
  );
}

export default DataGridExportToolbar;