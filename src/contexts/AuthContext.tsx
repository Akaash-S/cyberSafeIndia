import { createContext } from 'react';
import type { User } from 'firebase/auth';
import type { BackendUserData } from '../utils/authUtils';

export interface AuthContextType {
  user: User | null;
  backendUser: BackendUserData | null;
  loading: boolean;
  createAuthHeader: (user: User) => string;
}

export const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  backendUser: null,
  loading: true,
  createAuthHeader: () => ''
});
