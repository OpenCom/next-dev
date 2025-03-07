"use client"
import React, { useEffect, useState, type MouseEvent } from 'react';
import type { SpeseType } from '@/types/db';
import ExpenseForm from '@/app/components/spese/ExpenseForm';
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

  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const sidebarButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<Boolean>(true);
  const [spese, setSpese] = useState<SpeseType[]>([]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "costo", headerName: "Importo spesa", width: 150, editable: true },
    { field: "motivo", headerName: "Motivazione", width: 350, editable: true },
    {
      field: "pagata_da",
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

  function toggleSidebar(e: MouseEvent<HTMLButtonElement>){
    e.stopPropagation();
    if (sidebarRef.current && sidebarButtonRef.current) {
        const nextSidebarOpen = !isSidebarOpen;
        setIsSidebarOpen(nextSidebarOpen);
        if (isSidebarOpen) {
            sidebarRef.current.style.display='none';
            sidebarButtonRef.current.style.rotate='180deg';
        }
        else {
            sidebarRef.current.style.display='block';
            sidebarButtonRef.current.style.rotate='0deg';
        }
    }
  }

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
    <section className="flex flex-row min-h-svh">
      <aside className="flex flex-row bg-slate-200 min-h-full">
        <div className="p-8 min-w-xs max-w-[25vw] w-full" ref={sidebarRef}>
          {/* <h2 className="font-bold text-slate-600 uppercase tracking-tight">
            Aggiungi una nuova spesa
          </h2> */}
          <ExpenseForm />
        </div>
        <div className="border-x border-slate-300 h-full py-8 px-2">
          <button
            role="button"
            aria-label="Nascondi/Mostra la sidebar"
            onClick={toggleSidebar}
            ref={sidebarButtonRef}
            className="bg-slate-300 rounded-full p-2 transition-transform duration-300 ease-out"
          >
            &larr;
          </button>
        </div>
      </aside>
      <div className="p-8 px-12">
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
      </div>
    </section>
  );
}