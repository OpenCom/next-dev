'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateForMySQL } from '@/lib/time';
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ProgettoType } from '@/types/db';
import { useParams } from 'next/navigation';

export default function EditProgetto() {

  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProgettoType>({
    id_progetto: parseInt(id),
    nome: '',
    acronimo: '',
    codice_progetto: '',
    centro_costo: '',
    data_inizio: dayjs(),
    data_fine: dayjs().add(1, 'year'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate dates
      if (!formData.data_inizio || !formData.data_fine) {
        throw new Error('Le date sono obbligatorie');
      }

      if (formData.data_fine && formData.data_inizio && dayjs(formData.data_fine).isBefore(dayjs(formData.data_inizio))) {
        throw new Error('La data di fine non può essere precedente alla data di inizio');
      }

      const response = await fetch('/api/progetti', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          data_inizio: formatDateForMySQL(dayjs(formData.data_inizio).toDate()),
          data_fine: formatDateForMySQL(dayjs(formData.data_fine).toDate()),
        }),
      });

      console.log(response);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Errore durante la creazione della trasferta');
      }

      router.push('/progetti');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProgettoType) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  React.useEffect(() => {
    if (id) {
    const fetchProgetto = async () => {
        const response = await fetch(`/api/progetti?id=${id}`);
        const data = await response.json();
        console.log(data);
        setFormData({...data[0], data_inizio: dayjs(data[0].data_inizio), data_fine: dayjs(data[0].data_fine)});
        };
        fetchProgetto();
    }
  }, [id]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
           Progetto {formData.nome}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                required
                label="Nome"
                value={formData.nome}
                onChange={handleChange('nome')}
                fullWidth
              />

              <TextField
                required
                label="Acronimo"
                value={formData.acronimo}
                onChange={handleChange('acronimo')}
                fullWidth
              />

              <TextField
                required
                label="Codice Progetto"
                placeholder="ES. 2025-1-AA01-AA123-ABC-000123456"
                value={formData.codice_progetto}
                onChange={handleChange('codice_progetto')}
                fullWidth
              />

              <TextField
                required
                label="Centro di Costo"
                value={formData.centro_costo}
                onChange={handleChange('centro_costo')}
                fullWidth
              />


              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DatePicker
                  label="Data Inizio"
                  value={formData.data_inizio as dayjs.Dayjs}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_inizio: newValue as dayjs.Dayjs }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <DatePicker
                  label="Data Fine"
                  value={formData.data_fine as dayjs.Dayjs}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_fine: newValue as dayjs.Dayjs }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Modifica in corso...' : 'Modifica Progetto'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

