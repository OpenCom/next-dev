"use client";
import type { AuthUserType, JwtPayload } from '@/types/auth';
import React, { createContext, useState, useContext, useEffect, PropsWithChildren, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';


interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUserType | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Cookie utility per client-side
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inizializza lo stato di autenticazione
  useEffect(() => {
    // Verifica presenza del token
    const token = getCookie('userData');
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      // Verifica validità del token decodificandolo
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token scaduto
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Token valido, decodifica il payload
        setUser(decoded.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Errore nella verifica dell'autenticazione:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funzione di logout
  const logout = async () => {
    try {
      // Chiama l'API di logout per rimuovere i cookie lato server
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Aggiorna lo stato locale
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Errore durante il logout:", error);
      // Anche in caso di errore nella chiamata API, aggiorna lo stato locale
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Memoizza il valore del contesto
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      logout
    }),
    [isAuthenticated, user, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook per usare il contesto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};