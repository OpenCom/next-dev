'use client';

import { Box, Button, Typography } from '@mui/material';
import { AddCircle, Edit } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import type { ProgettoType } from '@/types/db';
import { formatDateForMySQL, parseMySQLDateString } from '@/lib/time';


export default function ProgettiPage() { 
    
    const [rows, setRows] = useState<ProgettoType[]>([]);

    const columns: GridColDef[] = [
        {
          field: 'id_progetto',
          headerName: 'ID',
          width: 60,
          hideable: true
        },
        {
          field: 'nome',
          headerName: 'Progetto',
          flex: 1,
        },
        {
          field: 'acronimo',
          headerName: 'Acronimo',
          flex: 1,
          width: 80,
        },
        {
          field: 'codice_progetto',
          headerName: 'Codice Progetto',
          flex: 1,
          width: 200,
        },
        {
          field: 'centro_costo',
          headerName: 'Centro Costo',
          flex: 1,
          width: 100,
        },
        {
          field: 'data_inizio',
          headerName: 'Data Inizio',
          width: 150,
          valueFormatter: ({ value }) => parseMySQLDateString(value),
          renderCell: (params) => {
            return formatDateForMySQL(params.value);
          }
        },
        {
          field: 'data_fine',
          headerName: 'Data Fine',
          width: 150,
          valueFormatter: ({ value }) => parseMySQLDateString(value),
          renderCell: (params) => {
            return formatDateForMySQL(params.value);
          }
        },
        {
          field: 'actions',
          headerName: 'Azioni',
          width: 150,
          renderCell: (params) => {
            return (
              <div>
                <Button href={`/progetti/edit/${params.row.id_progetto}`} variant="text" color="inherit" size='small' endIcon={<Edit />}>
                  Modifica
                </Button>
              </div>
            );
          }
        }
    ]

    useEffect(() => {
        const fetchProgetti = async () => {
            const response = await fetch('/api/generic/progetti');
            const data = await response.json();
            setRows(data.res);
        };
        fetchProgetti();
    }, []);


    return (
        <Box sx={{ height: '100%', width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Progetti
                </Typography>
                <Button href="/progetti/add" variant="contained" color="primary" endIcon={<AddCircle />}>
                    Nuovo Progetto
                </Button>
            </Box>
            <DataGrid
                rows={rows.map((row) => ({ ...row, id: row.id_progetto }))}
                columns={columns}
                // disableColumnMenu
                // disableColumnFilter
                // disableColumnSelector
                // disableDensitySelector
                // disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } }
                }}
            />
        </Box>
    );
}   