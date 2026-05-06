import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig'; 

/* https://react.dev/reference/react/createContext# */
const AuthContext = createContext(null);

/**
 * User info: { username, email, role, steamId? } - Match the back end
 * null when logged out
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // hydrating from storage

    /* Hydrating info from local Storage */
    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token  = localStorage.getItem('token');

        if (stored && token) {
            try {
                setUser(JSON.parse(stored));
                // Attach token to every future request
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoadingUser(false);
    }, []);

    // ── LOGIN ────────────────────────────────────────────────────────────
    // Request : POST /api/v1/auth/login  { username, password }
    // Response: { token, user: { username, email, role } }
    const login = async (username, password) => {
        const response = await api.post('/api/v1/auth/login', { username, password });
        const { token, user: userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return userData;
    };

    // ── REGISTRATION ────────────────────────────────────────────────────────────
    // Request : POST /api/v1/auth/register  { username, email, password }
    // Response: { token, user: { username, email, role } }
    const register = async (username, email, password) => {
        const response = await api.post('/api/v1/auth/register', { username, email, password });
        const { token, user: userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return userData;
    };

    // ── LOG OUT ────────────────────────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Keep steamId if you want Steam library to survive a normal logout
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // ── Steam login merges into existing session ───────────────────────────────
    // Called by Dashboard.jsx after Steam OAuth redirect completes.
    const mergeSteamId = (steamId) => {
        const updated = { ...user, steamId };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        // React v18 add .Provider
        <AuthContext.Provider value={{ user, loadingUser, login, register, logout, mergeSteamId }}>
            {children}
        </AuthContext.Provider>
    );
};

/** Convenience hook — use anywhere in the tree */
export const useAuth = () => useContext(AuthContext);
