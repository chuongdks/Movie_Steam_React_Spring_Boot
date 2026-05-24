import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig'; 
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── HELPER FUNCTIONS ─────────────────────────────────────────────────
    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/watchlist/${user.username}`);
            setWatchlist(res.data);
        } catch (err) {
            console.error('Failed to load watchlist:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load watchlist whenever the logged-in user changes
    useEffect(() => {
        if (user?.username) {
            fetchWatchlist();
        } else {
            setWatchlist([]); // clear on logout
        }
    }, [user?.username]);

    // ── CRUD OPERATIONS ─────────────────────────────────────────────────
    // Add a movie or game
    // Request : POST /api/v1/watchlist/${user.username}  { entityId, entityType: 'MOVIE'|'GAME', title, posterUrl }
    const addItem = async (item) => {
        if (!user) return;
        try {
            const res = await api.post(`/api/v1/watchlist/${user.username}`, item);
            setWatchlist(prev => [...prev, res.data]);
        } catch (err) {
            // 409 = already in list — surface to the caller
            throw err;
        }
    };

    // Delete a movie or game
    const removeItem = async (entityId) => {
        if (!user) return;
        await api.delete(`/api/v1/watchlist/${user.username}/${entityId}`);
        setWatchlist(prev => prev.filter(w => w.entityId !== entityId));
    };

    // Toggle Status of a Watch List Item
    const toggleStatus = async (entityId) => {
        if (!user) return;
        const item = watchlist.find(w => w.entityId === entityId);
        const newStatus = item.status === 'TO_WATCH' ? 'COMPLETED' : 'TO_WATCH';
        const res = await api.patch(
            `/api/v1/watchlist/${user.username}/${entityId}`,
            { status: newStatus }
        );
        setWatchlist(prev => prev.map(w => w.entityId === entityId ? res.data : w));
    };

    // Quick lookup, used by Hero + SteamLibrary to show filled/unfilled button
    const isInWatchlist = (entityId) => watchlist.some(w => w.entityId === entityId);

    return (
        <WatchlistContext.Provider value={{ watchlist, loading, addItem, removeItem, toggleStatus, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    )
}

export const useWatchlist = () => useContext(WatchlistContext);