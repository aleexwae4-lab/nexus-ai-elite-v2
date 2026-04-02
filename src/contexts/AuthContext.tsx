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
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log('AuthContext: Auth state changed', currentUser ? `User: ${currentUser.email}` : 'No user');
      
      if (unsubscribeDoc) {
        console.log('AuthContext: Cleaning up previous Firestore subscription');
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      setUser(currentUser);
      
      if (currentUser) {
        console.log('AuthContext: Setting up Firestore subscription for', currentUser.uid);
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('AuthContext: Firestore data received', { credits: data.credits });
            setCredits(data.credits || 0);
          } else {
            console.log('AuthContext: Firestore document does not exist for user');
            setCredits(0);
          }
          setLoading(false);
        }, (error) => {
          console.error('AuthContext: Firestore subscription error', error);
          setLoading(false);
        });
      } else {
        setCredits(0);
        setLoading(false);
      }
    });

    return () => {
      console.log('AuthContext: Unmounting, cleaning up all subscriptions');
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, credits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
