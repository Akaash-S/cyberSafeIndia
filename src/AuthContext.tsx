import React, { useEffect, useState } from 'react';
import { onAuthStateChanged} from 'firebase/auth';
import type { User} from 'firebase/auth';
import { auth } from './firebase';
import type { BackendUserData } from './utils/authUtils';
import { createAuthHeader, registerUserWithBackend } from './utils/authUtils';
import { AuthContext } from './contexts/AuthContext';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Register user with backend
        const backendData = await registerUserWithBackend(currentUser);
        setBackendUser(backendData);
      } else {
        setBackendUser(null);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      backendUser, 
      loading, 
      createAuthHeader 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
