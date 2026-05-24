import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig'; 

/* https://react.dev/reference/react/createContext# */
const AuthContext = createContext(null);

/**
 * User info: { username, email, role, steamId? } - Match the back end null when logged out
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
    // Request : POST /api/v1/auth/login  { "username": "john", "password": "secret123" }
    // Response: { "token": "lmao6767adasdw...", "user": { "username", "email", "role" } }
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
    // Request : POST /api/v1/auth/register  { "username": "john", "email": "a@b.com", "password": "secret123" }
    // Response: { "token": "lmao...", "user": { "username", "email", "role" } }
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

    // ── LINK STEAM ID ────────────────────────────────────────────────────
    // Called by SteamLibrary after the backend link-callback API redirects back.
    // Just updates in-memory + localStorage, backend already persisted it.
    const updateSteamId = (steamId) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, steamId };   // FYI this is Object Spread and it just add a steamId key to user
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    // ── UNLINK STEAM ID ────────────────────────────────────────────────────
    // Called when user clicks "Unlink Steam" in the header dropdown
    const unlinkSteam = async (username) => {
        await api.delete(`/api/v1/auth/steam/link?username=${username}`);
        localStorage.removeItem('steamId');
        updateSteamId(null);
    };

    return (
        // React v18 add .Provider
        <AuthContext.Provider value={{ user, loadingUser, login, register, logout, updateSteamId, unlinkSteam }}>
            {children}
        </AuthContext.Provider>
    );
};

// Convenience hook. Use anywhere in the tree. Ex: const { user, logout, ... } = useAuth();
export const useAuth = () => useContext(AuthContext);
