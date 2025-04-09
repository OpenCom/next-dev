// src/context/AuthContext.tsx

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useMemo,
  } from 'react';
  import { AuthUserType, AuthContextType } from '@/types/auth';
  
  // Chiave per salvare/recuperare dati da localStorage
  const AUTH_STORAGE_KEY = 'userData';
  
  // Crea il contesto con un valore iniziale (o undefined per forzare l'uso del Provider)
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  // Props per il componente Provider
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  // Componente Provider che gestirà lo stato
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUserType | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Inizia come true
  
    // Effetto per caricare lo stato dal localStorage all'avvio
    useEffect(() => {
      try {
        const storedUserData = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUserData) {
          const parsedUser: AuthUserType = JSON.parse(storedUserData);
          // Qui potresti aggiungere una validazione extra se necessario
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Errore nel caricare i dati utente dal localStorage:", error);
        // Se c'è un errore, pulisci localStorage per sicurezza
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false); // Fine del caricamento iniziale
      }
    }, []); // L'array vuoto assicura che venga eseguito solo al mount
  
    // Funzione per effettuare il login
    const login = (userData: AuthUserType) => {
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false); // Assicura che il loading sia false dopo il login
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error("Errore nel salvare i dati utente nel localStorage:", error);
      }
    };
  
    // Funzione per effettuare il logout
    const logout = () => {
      setUser(null);
      setIsAuthenticated(false);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        console.error("Errore nel rimuovere i dati utente dal localStorage:", error);
      }
    };
  
    // Memoizza il valore del contesto per evitare re-render non necessari
    const contextValue = useMemo(
      () => ({
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
      }),
      [isAuthenticated, user, isLoading] // Dipendenze per useMemo
    );
  
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Hook personalizzato per consumare il contesto più facilmente
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
    }
    return context;
  };