import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged} from 'firebase/auth';
import type { User} from 'firebase/auth';
import { auth } from '../firebase';
import api from '../services/api';
import { AuthContext, type BackendUserData } from './AuthContextDefinition';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        const response = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const responseData = response.data as { success: boolean; data?: BackendUserData; error?: string };
        if (responseData.success && responseData.data) {
          setBackendUser({
            uid: responseData.data.uid,
            email: responseData.data.email,
            displayName: responseData.data.displayName,
            photoURL: responseData.data.photoURL,
            emailVerified: responseData.data.emailVerified,
          });
        }
      } catch (error) {
        console.error('Error refreshing user data from backend:', error);
        setBackendUser(null);
      }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken();
          const response = await api.post('/user/login', { idToken });
          const responseData = response.data as { success: boolean; data?: BackendUserData; error?: string };
          if (responseData.success && responseData.data) {
            setBackendUser({
              uid: responseData.data.uid,
              email: responseData.data.email,
              displayName: responseData.data.displayName,
              photoURL: responseData.data.photoURL,
              emailVerified: responseData.data.emailVerified,
            });
          } else {
            console.error('Backend login failed:', responseData.error);
            setBackendUser(null);
          }
        } catch (error) {
          console.error('Error during backend login:', error);
          setBackendUser(null);
        }
      } else {
        setUser(null);
        setBackendUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      backendUser,
      loading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
