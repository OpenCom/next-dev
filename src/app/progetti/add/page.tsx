'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateForMySQL } from '@/lib/time';
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


interface Progetto {
  id_progetto: number;
  nome: string;
  data_inizio: dayjs.Dayjs;
  data_fine: dayjs.Dayjs | null;
}


export default function CreaTrasferta() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Progetto>({
    id_progetto: 0,
    nome: '',
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

      if (formData.data_fine.isBefore(formData.data_inizio)) {
        throw new Error('La data di fine non può essere precedente alla data di inizio');
      }

      const response = await fetch('/api/progetti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          data_inizio: formatDateForMySQL(formData.data_inizio.toDate()),
          data_fine: formatDateForMySQL(formData.data_fine.toDate()),
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

  const handleChange = (field: keyof Progetto) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Nuovo Progetto
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

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DatePicker
                  label="Data Inizio"
                  value={formData.data_inizio}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_inizio: newValue as dayjs.Dayjs }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <DatePicker
                  label="Data Fine"
                  value={formData.data_fine}
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
                  {loading ? 'Creazione in corso...' : 'Aggiungi Progetto'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

