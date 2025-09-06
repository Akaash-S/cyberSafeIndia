import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface BackendUserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  backendUser: BackendUserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  backendUser: null,
  loading: true,
  refreshUser: async () => {},
});
