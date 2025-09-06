import type { User } from 'firebase/auth';

export const createAuthHeader = (user: User): string => {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    admin: false
  };
  
  const encodedData = btoa(JSON.stringify(userData));
  return `Bearer ${encodedData}`;
};