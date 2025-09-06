import type { User } from 'firebase/auth';
import { toast } from './toast';

export interface BackendUserData {
  uid: string;
  email: string;
  displayName: string | null;
  admin: boolean;
  createdAt: string;
  lastLogin: string;
}

// Helper function to create auth header
export const createAuthHeader = (user: User): string => {
  const userData = {
    uid: user.uid,
    email: user.email || '',
    displayName: typeof user.displayName === 'string' ? user.displayName : '',
    photoURL: typeof user.photoURL === 'string' ? user.photoURL : '',
    admin: false // This will be updated after backend registration
  };
  
  const encodedData = btoa(JSON.stringify(userData));
  return `Bearer ${encodedData}`;
};

// Register user with backend
// Ensures all fields are properly validated and formatted before sending to backend
export const registerUserWithBackend = async (firebaseUser: User): Promise<BackendUserData | null> => {
  try {
    // Ensure all fields are properly formatted before sending to backend
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: typeof firebaseUser.displayName === 'string' ? firebaseUser.displayName : '',
      photoURL: typeof firebaseUser.photoURL === 'string' && firebaseUser.photoURL ? firebaseUser.photoURL : '',
      admin: false
    };

    // Validate required fields
    if (!userData.uid || !userData.email) {
      console.error('Invalid user data - missing required fields:', { uid: userData.uid, email: userData.email });
      return null;
    }

    // Log the full request payload for debugging
    console.log('Registering user with backend');

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('User successfully registered with backend!');
      return result.data;
    } else {
      // Handle specific error cases
      if (response.status === 409) {
        console.log('User already exists, returning existing user data');
        // Show friendly toast notification
        if (typeof window !== 'undefined') {
          toast.info('Welcome back! Your account is already set up.');
        }
        return result.data; // Return the existing user data instead of null
      } else {
        console.error('Backend registration failed:', result.message || result.error);
        console.error('Request payload was:', userData);
        // Show error toast
        if (typeof window !== 'undefined') {
          toast.error(result.message || 'Failed to register with backend. Please try again.');
        }
        return null;
      }
    }
  } catch (error) {
    console.error('Error registering user with backend:', error);
    return null;
  }
};
