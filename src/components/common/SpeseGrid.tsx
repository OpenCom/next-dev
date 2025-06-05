import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';
import DataGridExportToolbar from './DataGridExportToolbar';
import { valueFormatterCurrency, valueFormatterDate } from '@/lib/common';
import type { SpeseGridProps } from '@/types';

const columns: GridColDef[] = [
  {
    field: 'data_spesa',
    headerName: 'Data',
    width: 130,
    valueFormatter: valueFormatterDate
  },
  {
    field: 'nome_dipendente',
    headerName: 'Dipendente',
    width: 200
  },
  {
    field: 'nome_categoria',
    headerName: 'Categoria',
    width: 150
  },
  {
    field: 'descrizione',
    headerName: 'Descrizione',
    width: 250
  },
  {
    field: 'importo',
    headerName: 'Importo',
    width: 130,
    type: 'number',
    valueFormatter: valueFormatterCurrency
  },
  {
    field: 'stato_approvazione',
    headerName: 'Stato',
    width: 130,
    valueGetter: (params) => {
      const stato = params as string;
      return stato.charAt(0).toUpperCase() + stato.slice(1);
    }
  }
];

export default function SpeseGrid({ spese, loading = false, fileName = 'spese_report' }: SpeseGridProps) {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Paper sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={spese}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id_spesa}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'data_spesa', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{
            toolbar: DataGridExportToolbar,
          }}
          slotProps={{
            toolbar: {
              fileName,
              exportAllRows: false,
            } as any
          }}
        />
      </Paper>
    </Box>
  );
} 