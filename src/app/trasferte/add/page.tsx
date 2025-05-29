'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateForMySQL } from '@/lib/time';
import { TextField, Button, Box, Typography, Paper, MenuItem, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface Dipendente {
  id_dipendente: number;
  nome: string;
  cognome: string;
  ruolo: string;
}

interface Progetto {
  id_progetto: number;
  nome: string;
}

interface FormData {
  luogo: string;
  data_inizio: dayjs.Dayjs | null;
  data_fine: dayjs.Dayjs | null;
  budget: string;
  motivo_viaggio: string;
  note: string;
  id_progetto: string;
  id_responsabile: string;
}

export default function CreaTrasferta() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [progetti, setProgetti] = useState<Progetto[]>([]);
  const [formData, setFormData] = useState<FormData>({
    luogo: '',
    data_inizio: null,
    data_fine: null,
    budget: '',
    motivo_viaggio: '',
    note: '',
    id_progetto: '',
    id_responsabile: '',
  });

  useEffect(() => {
    const fetchDipendenti = async () => {
      try {
        const response = await fetch('/api/generic/dipendenti');
        if (!response.ok) {
          throw new Error('Errore nel recupero dei dipendenti');
        }
        const data = await response.json();
        // Filter out "contabile" users
        const filteredDipendenti = data.res.filter((d: Dipendente) => d.ruolo !== 'contabile');
        setDipendenti(filteredDipendenti);
      } catch (err) {
        console.error('Error fetching dipendenti:', err);
        setError('Errore nel recupero dei dipendenti');
      }
    };

    const fetchProgetti = async () => {
      try {
        const response = await fetch('/api/generic/progetti');
        if (!response.ok) {
          console.log(response);
          throw new Error('Errore nel recupero dei progetti');
        }
        const data = await response.json();
        setProgetti(data.res);
      } catch (err) {
        console.error('Error fetching progetti:', err);
        setError('Errore nel recupero dei progetti');
      }
    };

    fetchDipendenti();
    fetchProgetti();
  }, []);

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

      const response = await fetch('/api/trasferte', {
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

      router.push('/trasferte');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
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
            Nuova Trasferta
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
                label="Luogo"
                value={formData.luogo}
                onChange={handleChange('luogo')}
                fullWidth
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DatePicker
                  label="Data Inizio"
                  value={formData.data_inizio}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_inizio: newValue }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <DatePicker
                  label="Data Fine"
                  value={formData.data_fine}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_fine: newValue }))}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Box>

              <TextField
                required
                label="Budget"
                type="number"
                value={formData.budget}
                onChange={handleChange('budget')}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: '€',
                  }
                }}
              />

              <TextField
                required
                label="Motivo del Viaggio"
                value={formData.motivo_viaggio}
                onChange={handleChange('motivo_viaggio')}
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Note"
                value={formData.note}
                onChange={handleChange('note')}
                fullWidth
                multiline
                rows={3}
              />

            {progetti.length > 0 ? (
              <TextField
                required
                select
                label="Progetto"
                value={formData.id_progetto}
                onChange={handleChange('id_progetto')}
                fullWidth
              >
                {progetti.map((progetto) => (
                  <MenuItem key={progetto.id_progetto} value={progetto.id_progetto.toString()}>
                    {progetto.nome}
                  </MenuItem>
                ))}
              </TextField>
              ) : <Typography>Nessun progetto disponibile al momento</Typography>}

              {dipendenti.length > 0 ? (
              <TextField
                required
                select
                label="Responsabile"
                value={formData.id_responsabile}
                onChange={handleChange('id_responsabile')}
                fullWidth
              >
                {dipendenti.map((dipendente) => (
                  <MenuItem key={dipendente.id_dipendente} value={dipendente.id_dipendente.toString()}>
                    {dipendente.nome} {dipendente.cognome}
                  </MenuItem>
                ))}
              </TextField>
              ) : <Typography>Nessun dipendente disponibile al momento</Typography>}

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
                  {loading ? 'Creazione in corso...' : 'Crea Trasferta'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

