// src/AuthProvider.jsx
import { useState, createContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsloggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsloggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
