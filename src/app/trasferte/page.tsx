'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Typography, Paper } from '@mui/material';
import DataGridExportToolbar from '@/components/common/DataGridExportToolbar';
import type { TrasfertaType } from '@/types/db';
import { useSearchParams } from 'next/navigation';
import { valueFormatterCurrency } from '@/lib/common';
import Link from 'next/link';

interface TrasfertaWithDetails extends TrasfertaType {
  nome_progetto: string;
  nome_responsabile: string;
}

// Define all possible optional columns
const optionalColumns: Record<string, GridColDef> = {
  responsabile: {
    field: 'nome_responsabile',
    headerName: 'Responsabile',
    width: 200
  },
  data_inizio: {
    field: 'data_inizio',
    headerName: 'Data Inizio',
    width: 130,
    type: 'date',
    valueFormatter: (params: GridRenderCellParams) => {
      if (!params.value) return '';
      return new Date(params.value as string).toLocaleDateString('it-IT');
    }
  },
  data_fine: {
    field: 'data_fine',
    headerName: 'Data Fine',
    width: 130,
    type: 'date',
    valueFormatter: (params: GridRenderCellParams) => {
      if (!params.value) return '';
      return new Date(params.value as string).toLocaleDateString('it-IT');
    }
  },
  motivo: {
    field: 'motivo_viaggio',
    headerName: 'Motivo',
    width: 200
  },
  note: {
    field: 'note',
    headerName: 'Note',
    width: 200
  }
};

// Define required columns that are always shown
const requiredColumns: GridColDef[] = [
  {
    field: 'id_trasferta',
    headerName: 'ID',
    width: 90,
    hideable: false
  },
  {
    field: 'luogo',
    headerName: 'Luogo',
    width: 200
  },
  {
    field: 'nome_progetto',
    headerName: 'Progetto',
    width: 200
  },
  {
    field: 'budget',
    headerName: 'Budget',
    width: 130,
    type: 'number',
    valueFormatter: valueFormatterCurrency
  },
  {
    field: 'actions',
    headerName: 'Azioni',
    width: 130,
    renderCell: (params) => {
      return <Link href={`trasferte/${params.row.id_trasferta}`}>Visualizza</Link>;
    }
  }
];

export default function TrasfertePage() {
  const [trasferte, setTrasferte] = useState<TrasfertaWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Get the fields parameter and parse it
  const fieldsParam = searchParams.get('fields');
  const requestedFields = fieldsParam ? fieldsParam.split(',') : [];

  // Build the columns array based on requested fields
  const columns: GridColDef[] = [
    ...requiredColumns,
    ...requestedFields
      .filter(field => field in optionalColumns)
      .map(field => optionalColumns[field])
  ];

  useEffect(() => {
    const fetchTrasferte = async () => {
      try {
        const response = await fetch('/api/trasferte');
        if (!response.ok) {
          throw new Error('Failed to fetch trasferte');
        }
        const data = await response.json();
        setTrasferte(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrasferte();
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Trasferte
      </Typography>
      <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <DataGrid
          rows={trasferte}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id_trasferta}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'data_inizio', sort: 'desc' }],
            },
            columns: { // Add this to control column visibility
                columnVisibilityModel: {
                    id_trasferta: false, // Hide the id_trasferta column
                },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{
            toolbar: DataGridExportToolbar,
          }}
          slotProps={{
            toolbar: {
              fileName: 'trasferte_report',
              exportAllRows: false,
            } as any
          }}
        />
      </Paper>
    </Box>
  );
}
