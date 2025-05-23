'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import SubHeader from '@/components/global/SubHeader';
import type { UserType, DipendenteType } from '@/types/db';

type DipendenteWithDipartimento = DipendenteType & { nome_dipartimento: string };

type AccountData = {
  user: UserType;
  dipendente: DipendenteWithDipartimento;
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const response = await fetch('/api/account');
        if (!response.ok) {
          throw new Error('Failed to fetch account data');
        }
        const data = await response.json();
        setAccountData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAccountData();
    }
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!accountData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No account data available</Typography>
      </Box>
    );
  }

  const { user, dipendente } = accountData;

  return (
    <Box sx={{ p: 3 }}>
      <SubHeader 
        pageType="Account"
        title="Dettagli Account"
      />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Informazioni Utente</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography><strong>Username:</strong> {user.username}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Ultimo Accesso:</strong> {user.ultimo_accesso ? new Date(user.ultimo_accesso).toLocaleString('it-IT') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Ruolo Admin:</strong> {user.is_admin ? 'Sì' : 'No'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Informazioni Dipendente</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography><strong>Nome:</strong> {dipendente.nome}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Cognome:</strong> {dipendente.cognome}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Email:</strong> {dipendente.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Ruolo:</strong> {dipendente.ruolo}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Dipartimento:</strong> {dipendente.nome_dipartimento}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
