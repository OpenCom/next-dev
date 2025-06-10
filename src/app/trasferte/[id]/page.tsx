'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Chip, Grid2 as Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { valueFormatterCurrency, valueFormatterDate } from '@/lib/common';
import type { TrasfertaWithDetails, SpesaWithDetails } from '@/types';
import type { SpesaType, CategoriaSpesaType } from '@/types/db';
import Tooltip from '@mui/material/Tooltip';
import {
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  ChevronRight as ChevronRightIcon,
  MenuOpen as MenuOpenIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';

import {
  GridRowModesModel,
  GridRowModes,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridToolbarContainer,
  // GridToolbarProps,
  useGridApiRef,
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import SubHeader from '@/components/global/SubHeader';
import { formatDateForMySQL, parseMySQLDateString } from '@/lib/time';
import { useSession } from 'next-auth/react';
import CheckUserSessionWrapper from '@/components/common/checkUserSession';
import { useParams } from 'next/navigation';
import { DataGridExportToolbarInner } from '@/components/common/DataGridExportToolbar';


export default function TrasfertaPage() {
  const params = useParams();
  const id = params.id as string;
  const [trasferta, setTrasferta] = useState<TrasfertaWithDetails | null>(null);
  const [spese, setSpese] = useState<SpesaWithDetails[]>([]);
  const [totalSpese, setTotalSpese] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoriaSpesaType[]>([]);
  const [showDetails, setShowDetails] = useState(true);
  // Editable Spese DataGrid logic
  const [speseRows, setSpeseRows] = useState<SpesaWithDetails[]>(spese);
  const [speseRowModesModel, setSpeseRowModesModel] = useState<GridRowModesModel>({});
  const apiRef = useGridApiRef();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trasferta and spese
        const response = await fetch(`/api/trasferte/${id}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch trasferta');
        }
        const data = await response.json();
        setTrasferta(data.trasferta);
        setSpese(data.spese);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categorie', {
          credentials: 'include'
        });
        if (!categoriesResponse.ok) {
          throw new Error('Errore nel recupero delle categorie');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    } else if (params.reason === GridRowEditStopReasons.enterKeyDown) {
      event.defaultMuiPrevented = true;
      handleSpeseSaveClick(params.id)();
    }
  };

  const handleSpeseEditClick = (id: GridRowId) => () => {
    setSpeseRowModesModel({ ...speseRowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSpeseSaveClick = (id: GridRowId) => async () => {
    try {
      // First, commit any pending changes
      apiRef.current.stopRowEditMode({ id, ignoreModifications: false });

      // Add a small delay to ensure changes are committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the current values from the editing row
      const editingRow = apiRef.current.getRow(id);
      if (!editingRow) {
        throw new Error('Row not found');
      }

      // Format the date to YYYY-MM-DD
      const inputDate = editingRow.data_spesa ? editingRow.data_spesa : new Date().toISOString();

      // Determine if this is a new spesa or an update
      const isNewSpesa = !editingRow.uuid_spesa;

      // Create a SpesaType object with only the necessary fields
      const spesaToSave: SpesaType = {
        id_spesa: isNewSpesa ? null : editingRow.id_spesa,
        uuid_spesa: isNewSpesa ? null : editingRow.uuid_spesa,
        id_trasferta: editingRow.id_trasferta,
        id_categoria: editingRow.id_categoria,
        id_dipendente: editingRow.id_dipendente,
        data_spesa: formatDateForMySQL(inputDate)!,
        descrizione: editingRow.descrizione,
        importo: typeof editingRow.importo === 'string' ? parseFloat(editingRow.importo) : editingRow.importo,
        scontrino_url: editingRow.scontrino_url || undefined,
        stato_approvazione: editingRow.stato_approvazione,
        is_deleted: editingRow.is_deleted,
        created_at: editingRow.created_at,
        updated_at: new Date().toISOString()
      };

      const endpoint = isNewSpesa ? '/api/spesa/new' : `/api/spesa/${editingRow.uuid_spesa}`;
      const method = isNewSpesa ? 'POST' : 'PUT';

      // Make API call to save the data
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(spesaToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to ${isNewSpesa ? 'create' : 'update'} spesa: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

      // Update local state
      setSpeseRowModesModel({ ...speseRowModesModel, [id]: { mode: GridRowModes.View } });
      
      // Refresh the spese data to ensure we have the latest from the server
      await refreshSpese(editingRow.id_trasferta, setSpese);
      
      // Show success message
      // alert(`Spesa ${isNewSpesa ? 'creata' : 'salvata'} con successo`);
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

  const processSpeseRowUpdate = async (newRow: GridRowModel) => {
    try {
      const updatedRow = { ...newRow };
      setSpeseRows(speseRows.map((row) => (row.id_spesa === newRow.id_spesa ? updatedRow as SpesaWithDetails : row)));
      return updatedRow;
    } catch (error) {
      console.error('Error updating row:', error);
      return null;
    }
  };

  const handleSpeseRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setSpeseRowModesModel(newRowModesModel);
  };


  function SpeseEditToolbar() { //props: GridToolbarProps
    const handleClick = () => {
      const newId = Math.max(...speseRows.map(row => row.id_spesa), 0) + 1;
      const newRow: SpesaWithDetails = {
        id_spesa: newId, // Temporary ID, will be replaced by server
        uuid_spesa: '', // Will be generated by server
        descrizione: '',
        importo: '0.00',
        data_spesa: new Date().toISOString(),
        stato_approvazione: 'presentata',
        scontrino_url: '',
        id_categoria: categories[0].id_categoria,
        nome_categoria: categories[0].nome,
        id_dipendente: user!.id_dipendente,
        nome_dipendente: user!.nome, 
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
    };
    return (
      <GridToolbarContainer>
        <Tooltip title="Aggiungi spesa">
          <Button onClick={handleClick} startIcon={<AddIcon fontSize="small" />} size="small">
            Aggiungi
          </Button>
        </Tooltip>
        <DataGridExportToolbarInner fileName={`report_trasferta_${trasferta.luogo}`} exportAllRows={false} showEmailOptions={true} />
      </GridToolbarContainer>
    );
  }

  function caricaScontrino() { //id_spesa: number
    return () => alert('Funzione non implementata');
    // npm i react-filepond
  }
  const speseColumns: GridColDef[] = [
    { 
      field: 'id_categoria', 
      headerName: 'Categoria', 
      flex: 1, 
      editable: true, 
      type: 'singleSelect',
      valueOptions: categories.map(cat => ({
        value: cat.id_categoria,
        label: cat.nome
      })),
      renderCell: (params) => {
        const category = categories.find(cat => cat.id_categoria === params.value);
        return category ? category.nome : '';
      },
      // valueSetter: (params) => {
      //   const newValue = params.value;
      //   return { ...params.row, id_categoria: newValue };
      // }
    },
    { field: 'descrizione', headerName: 'Descrizione', flex: 2, editable: true },
    { 
      field: 'importo', 
      headerName: 'Importo', 
      flex: 1, 
      editable: true, 
      type: 'number', 
      renderCell: (params) => {
        return valueFormatterCurrency(params.value);
      }
    },
    { 
      field: 'data_spesa', 
      headerName: 'Data', 
      type: 'date', 
      flex: 1, 
      editable: true, 
      valueFormatter: ({ value }) => parseMySQLDateString(value),
      renderCell: (params) => {
        return formatDateForMySQL(params.value);
      }
    },
    { 
      field: 'stato_approvazione', 
      headerName: 'Stato', 
      flex: 1, 
      editable: true, 
      type: 'singleSelect', 
      valueOptions: ['presentata', 'approvata', 'respinta'] 
    },
    {
      field: 'scontrino_url',
      headerName: 'Scontrino',
      flex: 1,
      editable: false,
      width: 50,
      renderCell: (params) => {
        if (!params.value) return (
          <Button onClick={caricaScontrino} size="small" title="Carica scontrino" color="inherit" variant="text">
            <UploadIcon />
          </Button>
        );
        return (
          <Button variant="text" href={params.value} target="_blank" color="inherit" size="small" title="Apri scontrino in una nuova scheda">
            <ReceiptLongIcon />
          </Button>
        );
      }
    },
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
            <GridActionsCellItem key="save-icon" icon={<SaveIcon />} label="Salva" onClick={handleSpeseSaveClick(id)} color="inherit" />, 
            <GridActionsCellItem key="cancel-icon" icon={<CancelIcon />} label="Annulla" onClick={handleSpeseCancelClick(id)} color="inherit" />
          ];
        }
        return [
          <GridActionsCellItem key="edit-icon" icon={<EditIcon />} label="Modifica" onClick={handleSpeseEditClick(id)} color="inherit" />, 
          <GridActionsCellItem key="delete-icon" icon={<DeleteIcon />} label="Elimina" onClick={handleSpeseDeleteClick(id)} color="inherit" />
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
      label: 'Rimanente', 
      value: valueFormatterCurrency(remainingBudget),
      type: 'chip',
      color: remainingBudget >= 0 ? 'success' : 'error'
    },
  ] : [];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Errore: {error}</Typography>
      </Box>
    );
  }

  if (loading || !trasferta) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Caricamento...</Typography>
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
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Sidebar con info trasferta */} 
        <Grid size={{xs: 12, md: 4, lg: 3
        }}>
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Dettagli Trasferta
            </Typography>
            <Button variant="text" color="inherit" size="small" startIcon={showDetails ? <MenuOpenIcon /> : <ChevronRightIcon />} title="Nascondi dettagli" onClick={() => setShowDetails(!showDetails)}>
            </Button>
            </Box>
            {showDetails && (
            <Box>
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
                  '& .MuiDataGrid-cell p': {
                    textWrap: 'pretty',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    display: 'block',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    display: 'none',
                  },
                  padding: 1,
                }}
              />
            </Box>
            )}
          </>
        </Grid>
        {/* Griglia con le spese */}
        <Grid size={{xs: 12, md: showDetails ? 8 : 12, lg: showDetails ? 9 : 12}}>
          <>
            <Typography variant="h6" gutterBottom>
              Spese
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <DataGrid
                apiRef={apiRef}
                rows={speseRows.map((row) => ({ ...row, id: row.id_spesa }))}
                columns={speseColumns}
                editMode="row"
                rowModesModel={speseRowModesModel}
                onRowModesModelChange={handleSpeseRowModesModelChange}
                onRowEditStop={handleSpeseRowEditStop}
                processRowUpdate={processSpeseRowUpdate}
                slots={{ toolbar: SpeseEditToolbar }}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                  '& .actions': { color: 'text.secondary' },
                  '& .textPrimary': { color: 'text.primary' },
                }}
              />
            </Box>
          </>
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