import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';
import WatchlistCard from './WatchListCard';

const WatchList = () => {
    const { user } = useAuth();
    const { watchlist, loading } = useWatchlist();
    const navigate = useNavigate();

    const [typeFilter,   setTypeFilter]   = useState('ALL');   // ALL | MOVIE | GAME
    const [statusFilter, setStatusFilter] = useState('ALL');   // ALL | TO_WATCH | COMPLETED

    // ── Not logged in ─────────────────────────────────────────────────────────
    if (!user) {
        return (
            <Container className="text-center mt-5 py-5">
                <p style={{ fontSize: '3rem' }}>🔒</p>
                <h4 className="text-white mb-3">Login to use your Watchlist</h4>
                <p className="text-muted mb-4">Keep track of movies and games you want to watch or play.</p>
                <Button variant="outline-warning" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Container>
        );
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Container className="text-center mt-5 py-5">
                <p className="text-muted">Loading your watchlist...</p>
            </Container>
        );
    }

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = watchlist
        .filter(w => typeFilter   === 'ALL' || w.entityType === typeFilter)
        .filter(w => statusFilter === 'ALL' || w.status     === statusFilter);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalMovies    = watchlist.filter(w => w.entityType === 'MOVIE').length;
    const totalGames     = watchlist.filter(w => w.entityType === 'GAME').length;
    const totalCompleted = watchlist.filter(w => w.status === 'COMPLETED').length;
    const pct = watchlist.length > 0
        ? Math.round((totalCompleted / watchlist.length) * 100)
        : 0;

    return (
        <Container className="mt-5 pb-5">
            <h2 className="text-white mb-1">My Watchlist</h2>

            {/* Stats row */}
            <div className="wl-stats mb-4">
                <span>🎬 <strong>{totalMovies}</strong> movies</span>
                <span>🎮 <strong>{totalGames}</strong> games</span>
                <span>✓ <strong>{totalCompleted}</strong> completed</span>
                <span style={{ color: 'gold' }}><strong>{pct}%</strong> done</span>
            </div>

            {/* Filters */}
            <div className="d-flex gap-3 flex-wrap mb-4">
                <div>
                    <span className="wl-filter-label">Type</span>
                    <ButtonGroup size="sm">
                        {['ALL','MOVIE','GAME'].map(t => (
                            <Button
                                key={t}
                                variant={typeFilter === t ? 'warning' : 'outline-secondary'}
                                onClick={() => setTypeFilter(t)}
                            >
                                {t === 'ALL' ? 'All' : t === 'MOVIE' ? '🎬 Movies' : '🎮 Games'}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
                <div>
                    <span className="wl-filter-label">Status</span>
                    <ButtonGroup size="sm">
                        {['ALL','TO_WATCH','COMPLETED'].map(s => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? 'warning' : 'outline-secondary'}
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === 'ALL' ? 'All' : s === 'TO_WATCH' ? '⏳ To Watch' : '✓ Completed'}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
            </div>

            {/* Empty state */}
            {watchlist.length === 0 && (
                <div className="text-center py-5">
                    <p style={{ fontSize: '3rem' }}>🎞️</p>
                    <h5 className="text-white">Your watchlist is empty</h5>
                    <p className="text-muted">
                        Add movies from the <strong>Home</strong> page or games from your <strong>Steam Library</strong>.
                    </p>
                </div>
            )}

            {/* Filtered empty state */}
            {watchlist.length > 0 && filtered.length === 0 && (
                <p className="text-muted text-center py-4">No items match your filters.</p>
            )}

            {/* Card list */}
            <div className="wl-list">
                {filtered.map(item => (
                    <WatchlistCard key={item.entityId} item={item} />
                ))}
            </div>

            <style>{`
                .wl-stats {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    color: #aaa;
                    font-size: 0.9rem;
                }
                .wl-stats strong { color: #fff; }
                .wl-filter-label {
                    display: block;
                    font-size: 0.72rem;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }
                .wl-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
            `}</style>
        </Container>
    );
};

export default WatchList;
