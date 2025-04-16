"use client"
import React, { useEffect, useState, type MouseEvent } from 'react';
import type { SpesaType } from '@/types/db';
import { DataGrid, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';

import Link from 'next/link';


function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function getRowId(row: SpesaType) {
  return row.uuid_spesa;
}

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

  function mySaveOnServerFunction(updatedRow: SpesaType){
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
        <DataGrid
          getRowId={getRowId}
          initialState={{
            density: "compact",
          }}
          editMode="row" 
          rows={spese}
          columns={columns}
          slots={{ toolbar: CustomToolbar }}
          processRowUpdate={(updatedRow, originalRow, {rowId: GridRowId}) =>
            mySaveOnServerFunction(updatedRow)
          }
          rowHeight={28}
          onProcessRowUpdateError={(error: any)=>{throw error}}
        /> 
      </>
  );
}