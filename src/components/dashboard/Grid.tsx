"use client"
import React, { useEffect, useState } from 'react';
import type { SpesaType } from '@/types/db';
import { GridColDef, GridToolbarContainer, GridToolbarExport, GridRenderCellParams, DataGrid, gridClasses, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { alpha, styled } from '@mui/material/styles';
import Link from 'next/link';


function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function getRowId(row: GridValidRowModel) {
  return row.uuid_spesa;
}


const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity,
      ),
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
            theme.palette.action.selectedOpacity +
            theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  },
}));


export default function Grid({query = 'all/0'}: {query?: string}) {

  const [spese, setSpese] = useState<SpesaType[]>([]);

  const columns: GridColDef[] = [
    { field: "id_trasferta", headerName: "Trasferta" },
    { field: "id_categoria", headerName: "Categoria" },
    { field: "importo", headerName: "Importo spesa", width: 150, editable: true },
    { field: "descrizione", headerName: "Motivazione", minWidth: 320, editable: true },
    {
      field: "id_dipendente",
      headerName: "Dipendente",
      width: 150,
      editable: true,
    },
    {
      field: "actions",
      headerName: "Azioni",
      width: 100,
      editable: false,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, SpesaType>) =>
        (
            <Link href={`/edit/spesa/${params.id}`}>Modifica</Link>
        ),
    },
  ];

  function mySaveOnServerFunction(updatedRow: GridValidRowModel){
    // Da implementare
    return updatedRow
  }

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/spese/${query}`);
      const data = await res.json();
      setSpese(data.data);
    };

    fetchData();
  }, []);


  return (
    <>
        <StripedDataGrid
          getRowId={getRowId}
          rows={spese}
          columns={columns}
          loading={spese?.length === 0}
          initialState={{
            density: "compact",
          }}
          rowHeight={28}
          // editMode="row" 
          slots={{ toolbar: CustomToolbar }}
          // processRowUpdate={(updatedRow, originalRow, {rowId: GridRowId}) =>
          //   mySaveOnServerFunction(updatedRow)
          // }
          // onProcessRowUpdateError={(error: any)=>{throw error}}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
          }
        /> 
      </>
  );
}