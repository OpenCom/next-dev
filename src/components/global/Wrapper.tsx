"use client"
import { Box, ThemeProvider } from '@mui/material';
import Header from '@/components/global/Header';
import { SessionProvider } from 'next-auth/react';
import { theme } from '@/lib/theme';
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <>
      <ThemeProvider theme={theme}>
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Box sx={{ padding: '20px' }}>{children}</Box>
        </Box>
      </ThemeProvider>
      </>
    </SessionProvider>
  );
};

export default Wrapper;
