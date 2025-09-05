import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged} from 'firebase/auth';
import type { User} from 'firebase/auth';
import { auth } from './firebase';

interface BackendUserData {
  uid: string;
  email: string;
  displayName: string | null;
  admin: boolean;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  backendUser: BackendUserData | null;
  loading: boolean;
  createAuthHeader: (user: User) => string;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  backendUser: null,
  loading: true,
  createAuthHeader: () => ''
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to create auth header
const createAuthHeader = (user: User): string => {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    admin: false // This will be updated after backend registration
  };
  
  const encodedData = btoa(JSON.stringify(userData));
  return `Bearer ${encodedData}`;
};

// Register user with backend
const registerUserWithBackend = async (firebaseUser: User): Promise<BackendUserData | null> => {
  try {
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      admin: false
    };

    const response = await fetch('http://localhost:5000/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Backend registration failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error registering user with backend:', error);
    return null;
  }
};

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
