"use client"
import React, { useEffect, useState, type MouseEvent } from 'react';
import type { SpeseType } from '@/types/db';

import { DataGrid, GridRowsProp, GridColDef, GridToolbarContainer, GridToolbarExport, GridRenderCellParams } from '@mui/x-data-grid';

import Link from 'next/link';


function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }
  

export default function Home() {

  const [spese, setSpese] = useState<SpeseType[]>([]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "quanto", headerName: "Importo spesa", width: 150, editable: true },
    { field: "motivo", headerName: "Motivazione", width: 350, editable: true },
    {
      field: "fatta_da",
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
      renderCell: (params: GridRenderCellParams<any, SpeseType>) =>
        (
            <Link href={`/edit/spesa/${params.id}`}>Modifica</Link>
        ),
    },
  ];

  function mySaveOnServerFunction(updatedRow: any){
    console.log({updatedRow});
    alert('saved data');
  }

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/spese');
      const data = await res.json();
      setSpese(data.rows);
    };

    fetchData();
  }, []);


  const rows: GridRowsProp = spese;


  return (
    <>
        <DataGrid
          initialState={{
            density: "compact",
          }}
          editMode="row" 
          rows={rows}
          columns={columns}
          slots={{ toolbar: CustomToolbar }}
          processRowUpdate={(updatedRow, originalRow) =>
            mySaveOnServerFunction(updatedRow)
          }
          rowHeight={28}
          onProcessRowUpdateError={(error: any)=>{throw error}}
        />
      </>
  );
}