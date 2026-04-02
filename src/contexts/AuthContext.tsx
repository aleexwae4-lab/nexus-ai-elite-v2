import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: number;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, credits: 0 });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    console.log('AuthContext: Initializing onAuthStateChanged');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('AuthContext: Auth state changed', currentUser?.email);
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setCredits(doc.data().credits || 0);
        }
      });
      return unsubscribe;
    } else {
      setCredits(0);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, credits }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
