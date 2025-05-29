import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      await setPersistence(auth, browserSessionPersistence);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUsuario(user);
        setCarregando(false);
      });
      return unsubscribe;
    };

    const unsubscribePromise = setupAuth();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  const logout = () => {
    signOut(auth)
      .then(() => {
        setUsuario(null);
      })
      .catch((error) => {
        console.error("Erro ao fazer logout: ", error);
      });
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
