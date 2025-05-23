'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { use } from 'react';
import SpeseGrid from '@/components/common/SpeseGrid';
import { valueFormatterCurrency, valueFormatterDate } from '@/lib/common';
import type { TrasfertaWithDetails, SpesaWithDetails, NewSpesaWithDetails } from '@/types';
import type { SpesaType } from '@/types/db';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModesModel,
  GridRowModes,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridToolbarContainer,
  GridToolbarProps,
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import SubHeader from '@/components/global/SubHeader';
import { formatDateForMySQL, parseMySQLDateString } from '@/lib/time';
import { useSession } from 'next-auth/react';
import CheckUserSessionWrapper from '@/components/common/checkUserSession';


export default function TrasfertaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trasferta, setTrasferta] = useState<TrasfertaWithDetails | null>(null);
  const [spese, setSpese] = useState<SpesaWithDetails[]>([]);
  const [totalSpese, setTotalSpese] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable Spese DataGrid logic
  const [speseRows, setSpeseRows] = useState<SpesaWithDetails[]>(spese);
  const [speseRowModesModel, setSpeseRowModesModel] = useState<GridRowModesModel>({});

  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const fetchTrasferta = async () => {
      try {
        const response = await fetch(`/api/trasferte/${id}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch trasferta');
        }
        const data = await response.json();
        setTrasferta(data.trasferta);
        setSpese(data.spese);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrasferta();
  }, [id]);

  // Calculate totals whenever spese or trasferta changes
  useEffect(() => {
    if (trasferta) {
      const total = spese.reduce((sum, spesa) => sum + parseFloat(spesa.importo), 0);
      setTotalSpese(total);
      setRemainingBudget(trasferta.budget - total);
    }
  }, [spese, trasferta]);

  useEffect(() => {
    setSpeseRows(spese);
  }, [spese]);

  const handleSpeseRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleSpeseEditClick = (id: GridRowId) => () => {
    setSpeseRowModesModel({ ...speseRowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSpeseSaveClick = (id: GridRowId) => async () => {
    try {
      // Get the row being edited
      const row = speseRows.find((row) => row.id_spesa === Number(id));
      if (!row) {
        throw new Error('Row not found');
      }

      // Format the date to YYYY-MM-DD
      const inputDate = row.data_spesa ? row.data_spesa : new Date().toISOString();

      // Create a SpesaType object with only the necessary fields
      const spesaToSave: SpesaType = {
        id_spesa: row.id_spesa,
        uuid_spesa: row.uuid_spesa,
        id_trasferta: row.id_trasferta,
        id_categoria: row.id_categoria,
        id_dipendente: row.id_dipendente,
        data_spesa: formatDateForMySQL(inputDate)!,
        descrizione: row.descrizione,
        importo: typeof row.importo === 'string' ? parseFloat(row.importo) : row.importo,
        scontrino_url: row.scontrino_url || undefined,
        stato_approvazione: row.stato_approvazione,
        is_deleted: row.is_deleted,
        created_at: row.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(JSON.stringify(spesaToSave, null, 2));

      // Make API call to save the data
      const response = await fetch(`/api/spesa/${row.uuid_spesa}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(spesaToSave),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save spesa');
      }

      // Update local state only after successful save
      setSpeseRowModesModel({ ...speseRowModesModel, [id]: { mode: GridRowModes.View } });
      
      // Refresh the spese data to ensure we have the latest from the server
      refreshSpese(row.id_trasferta, setSpese);
      
      // Show success message
      alert('Spesa salvata con successo');
    } catch (error) {
      console.error('Error saving spesa:', error);
      alert(error instanceof Error ? error.message : 'Errore durante il salvataggio della spesa');
    }
  };

  const handleSpeseDeleteClick = (id: GridRowId) => async () => {
    const deletedSpesa = speseRows.find((row) => row.id_spesa === id);
    if (!deletedSpesa) {
      throw new Error('Spesa non trovata');
    }
    const response = await fetch(`/api/spesa/${deletedSpesa.uuid_spesa}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete spesa');
    }

    setSpeseRows(speseRows.filter((row) => row.id_spesa !== id));
  };

  const handleSpeseCancelClick = (id: GridRowId) => () => {
    setSpeseRowModesModel({
      ...speseRowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processSpeseRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow };
    setSpeseRows(speseRows.map((row) => (row.id_spesa === newRow.id_spesa ? updatedRow as SpesaWithDetails : row)));
    return updatedRow;
  };

  const handleSpeseRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setSpeseRowModesModel(newRowModesModel);
  };

  function SpeseEditToolbar(props: GridToolbarProps) {
    const handleClick = async () => {
      const newId = Math.max(...speseRows.map(row => row.id_spesa), 0) + 1;
      const newRow: SpesaWithDetails = {
        id_spesa: newId, // Temporary ID, will be replaced by server
        uuid_spesa: '', // Will be generated by server
        descrizione: '',
        importo: '0.00',
        data_spesa: '',
        stato_approvazione: 'presentata',
        scontrino_url: '',
        id_categoria: 0,
        nome_categoria: '', // Will be populated by server
        id_dipendente: user!.id_dipendente,
        nome_dipendente: '', // Will be populated by server
        id_trasferta: parseInt(id),
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSpeseRows([...speseRows, newRow]);
      setSpeseRowModesModel((oldModel) => ({
        ...oldModel,
        [newId]: { mode: GridRowModes.Edit, fieldToFocus: 'descrizione' },
      }));

      // Make API call to save the data
      const response = await fetch(`/api/spesa/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id_trasferta: parseInt(id),
          id_dipendente: user!.id_dipendente,
          id_categoria: newRow.id_categoria,
          descrizione: newRow.descrizione,
          importo: newRow.importo,
          data_spesa: formatDateForMySQL(newRow.data_spesa)!,
          stato_approvazione: newRow.stato_approvazione,
          scontrino_url: newRow.scontrino_url,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Errore nella creazione della spesa');
      }

      // Refresh the spese data to ensure we have the latest from the server
      refreshSpese(parseInt(id), setSpese);

    };
    return (
      <GridToolbarContainer>
        <Tooltip title="Aggiungi spesa">
          <Button onClick={handleClick} startIcon={<AddIcon fontSize="small" />} size="small">
            Aggiungi
          </Button>
        </Tooltip>
      </GridToolbarContainer>
    );
  }

  const speseColumns: GridColDef[] = [
    { field: 'descrizione', headerName: 'Descrizione', flex: 2, editable: true },
    { field: 'importo', headerName: 'Importo', flex: 1, editable: true, type: 'number', valueFormatter: ({ value }) => valueFormatterCurrency(value) },
    { field: 'data_spesa', headerName: 'Data', type: 'date', flex: 1, editable: true, valueFormatter: ({ value }) => parseMySQLDateString(value) },
    { field: 'stato_approvazione', headerName: 'Stato', flex: 1, editable: true, type: 'singleSelect', valueOptions: ['presentata', 'approvata', 'respinta'] },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = speseRowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem icon={<SaveIcon />} label="Salva" onClick={handleSpeseSaveClick(id)} color="inherit" />, 
            <GridActionsCellItem icon={<CancelIcon />} label="Annulla" onClick={handleSpeseCancelClick(id)} color="inherit" />
          ];
        }
        return [
          <GridActionsCellItem icon={<EditIcon />} label="Modifica" onClick={handleSpeseEditClick(id)} color="inherit" />, 
          <GridActionsCellItem icon={<DeleteIcon />} label="Elimina" onClick={handleSpeseDeleteClick(id)} color="inherit" />
        ];
      },
    },
  ];

  const trasfertaColumns: GridColDef[] = [
    {
      field: 'label',
      headerName: 'Campo',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="subtitle2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'value',
      headerName: 'Valore',
      flex: 2,
      renderCell: (params) => {
        if (params.row.type === 'chip') {
          return (
            <Chip
              label={params.value}
              color={params.row.color as 'success' | 'error'}
              size="small"
            />
          );
        }
        return <Typography>{params.value}</Typography>;
      },
    },
  ];

  const trasfertaRows = trasferta ? [
    { id: 1, label: 'Progetto', value: trasferta.nome_progetto },
    { id: 2, label: 'Responsabile', value: trasferta.nome_responsabile },
    { id: 3, label: 'Periodo', value: `${valueFormatterDate(trasferta.data_inizio)} ${trasferta.data_fine ? ' - ' + valueFormatterDate(trasferta.data_fine) : ''}` },
    { id: 4, label: 'Motivo', value: trasferta.motivo_viaggio },
    ...(trasferta.note ? [{ id: 5, label: 'Note', value: trasferta.note }] : []),
    { id: 6, label: 'Budget Totale', value: valueFormatterCurrency(trasferta.budget) },
    { id: 7, label: 'Totale Spese', value: valueFormatterCurrency(totalSpese) },
    { 
      id: 8, 
      label: 'Budget Rimanente', 
      value: valueFormatterCurrency(remainingBudget),
      type: 'chip',
      color: remainingBudget >= 0 ? 'success' : 'error'
    },
  ] : [];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (loading || !trasferta) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SubHeader 
        pageType="Trasferta"
        title={trasferta.luogo}
        breadcrumbs={[
          { label: 'Trasferte', href: '/trasferte' },
          { label: trasferta.luogo, href: `/trasferte/${id}` }
        ]}
      />

      <CheckUserSessionWrapper>
      <Grid container spacing={3}>
        {/* Sidebar with trasferta info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dettagli Trasferta
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <DataGrid
                rows={trasfertaRows}
                columns={trasfertaColumns}
                hideFooter
                disableColumnMenu
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    display: 'none',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Main content with spese grid */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 'calc(100vh - 200px)' }}>
            <Typography variant="h6" gutterBottom>
              Spese
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <DataGrid
                rows={speseRows.map((row) => ({ ...row, id: row.id_spesa }))}
                columns={speseColumns}
                editMode="row"
                rowModesModel={speseRowModesModel}
                onRowModesModelChange={handleSpeseRowModesModelChange}
                onRowEditStop={handleSpeseRowEditStop}
                processRowUpdate={processSpeseRowUpdate}
                slots={{ toolbar: SpeseEditToolbar }}
                disableRowSelectionOnClick
                sx={{
                  '& .actions': { color: 'text.secondary' },
                  '& .textPrimary': { color: 'text.primary' },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      </CheckUserSessionWrapper>
    </Box>
  );
} 


async function refreshSpese(id_trasferta: number, setSpese: (spese: SpesaWithDetails[]) => void) {
  // Refresh the spese data to ensure we have the latest from the server
  const refreshResponse = await fetch(`/api/trasferte/${id_trasferta}`, {
    credentials: 'include'
  });

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh data');
  }

  const refreshData = await refreshResponse.json();
  
  setSpese(refreshData.spese);
} 