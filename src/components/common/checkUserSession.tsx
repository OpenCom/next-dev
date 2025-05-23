import React from 'react';
import { useSession } from 'next-auth/react';
import { Box, Alert } from '@mui/material';
import { CircularProgress } from '@mui/material';

export default function CheckUserSessionWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please log in to view the dashboard</Alert>
      </Box>
    );
  }
  
  return <>{children}</>;
}