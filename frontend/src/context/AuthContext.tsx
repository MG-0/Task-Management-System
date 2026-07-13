import api from "../services/api";
import { useState, useEffect, useContext, createContext } from "react";



interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface AuthContextType {
    user: User| null;
    loading: boolean;
    login: (token: string, user:User) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [ loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/me');
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('token')
                    setUser(null);
                }
            }
            setLoading(false);
        }
        checkAuth();
    }, [])

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);
    }

    const logout = async () => {
        try {
            await api.post('/logout')
        } catch (error) {
            console.error('Logout error on backend:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    }

    const value = {
        user,
        loading,
        login,
        logout
    }
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

