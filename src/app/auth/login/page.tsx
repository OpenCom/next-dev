'use client'
import React, { ChangeEvent, FormEvent } from "react";
import { useSearchParams } from 'next/navigation'
import { TextField, Button, Typography, Alert, Box, Link } from '@mui/material';

function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [formData, setFormData] = React.useState<>({
    email: "",
    password: ""
  });

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setLoading(true);
      setError("");
  
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        console.log(JSON.stringify(formData));
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Errore durante la registrazione");
        }
  
        // Registrazione completata con successo
        router.push("/auth/login?registered=true");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Si è verificato un errore sconosciuto");
        }
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
      {registered === 'true' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <strong>Registrazione completata!</strong> Ora puoi effettuare il login con il tuo username e password.
        </Alert>
      )}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box 
        component="form" 
        action="/api/auth/login" 
        method="POST" 
        display="flex" 
        flexDirection="column" 
        gap={2} 
        width="100%" 
        maxWidth="400px"
      >
        <TextField
          label="Username o Email"
          name="username"
          id="username"
          placeholder="nome.cognome@opecom-italy.org"
          required
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          id="password"
          type="password"
          required
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Accedi
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