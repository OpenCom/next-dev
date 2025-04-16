'use client';
import React, { ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from 'next/navigation'
import { TextField, Button, Typography, Box, Link } from '@mui/material';
import Alert from "@/components/ui/Alert";
import { AuthFormDataType_Login } from "@/types/auth";

function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const router = useRouter();

  const [formData, setFormData] = React.useState<AuthFormDataType_Login>({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: formData.identifier, password: formData.password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh" 
      px={2}
    >
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Login
      </Typography>
      {registered === 'true' && !error && (
        <Alert severity="success" closable={true}>
          <strong>Registrazione completata!</strong> Ora puoi effettuare il login con il tuo username e password.
        </Alert>
      )}
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        display="flex" 
        flexDirection="column" 
        gap={2} 
        width="100%" 
        maxWidth="400px"
      >
        <TextField
          label="Email o Username"
          name="identifier"
          id="identifier"
          onChange={handleChange} 
          value={formData.identifier}
          placeholder="nome.cognome@opecom-italy.org"
          required
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          id="password"
          type="password"
          onChange={handleChange} 
          value={formData.password}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Non hai ancora un account?{' '}
        <Link href="/auth/register" underline="hover">
          Registrati
        </Link>
      </Typography>
    </Box>
  );
}

export default LoginPage;