import { useState } from 'react';
import { useWatchlist } from '../../context/WatchlistContext';

/**
 * Displays one watchlist item.
 * Props come directly from the WatchlistItem shape returned by the backend.
 */
const WatchlistCard = ({ item }) => {
    const { removeItem, toggleStatus } = useWatchlist();
    const [busy, setBusy] = useState(false);

    // ── HELPER FUNCTIONS ─────────────────────────────────────────────────
    const handleToggle = async () => {
        setBusy(true);
        try { 
            await toggleStatus(item.entityId); 
        }
        finally { 
            setBusy(false); 
        }
    };

    const handleRemove = async () => {
        setBusy(true);
        try { 
            await removeItem(item.entityId); 
        }
        finally { 
            setBusy(false); 
        }
    };

    const isCompleted = item.status     === 'COMPLETED';
    const isGame      = item.entityType === 'GAME';

    return (
        // Display the Watchlist here
        <div className={`wl-card ${isCompleted ? 'wl-card--done' : ''}`}>
            {/* Poster / Art */}
            <div className="wl-art">
                {item.posterUrl
                    ? <img src={item.posterUrl} alt={item.title} loading="lazy" />
                    : <div className="wl-art-placeholder">{item.title[0]}</div>
                }
                {/* Completed item overlay */}
                {isCompleted && (
                    <div className="wl-done-overlay">✓</div>
                )}
            </div>

            {/* Info */}
            <div className="wl-info">
                <div className="wl-badges">
                    <span className={`wl-type-badge ${isGame ? 'badge-game' : 'badge-movie'}`}>
                        {isGame ? '🎮 Game' : '🎬 Movie'}
                    </span>
                    <span className={`wl-status-badge ${isCompleted ? 'status-done' : 'status-pending'}`}>
                        {isCompleted ? 'Completed' : 'To Watch'}
                    </span>
                </div>
                <h3 className="wl-title">{item.title}</h3>
                <p className="wl-date">
                    Added {new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>

                {/* Actions */}
                <div className="wl-actions">
                    <button
                        className={`wl-btn wl-btn-toggle ${isCompleted ? 'wl-btn-undo' : 'wl-btn-complete'}`}
                        onClick={handleToggle}
                        disabled={busy}
                    >
                        {isCompleted ? '↩ Mark Unwatched' : '✓ Mark Complete'}
                    </button>

                    <button
                        className="wl-btn wl-btn-remove"
                        onClick={handleRemove}
                        disabled={busy}
                        aria-label="Remove from watchlist"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <style>{`
                .wl-card {
                    display: flex;
                    gap: 14px;
                    background: #1a1a1a;
                    border: 1px solid #2a2a2a;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: border-color 0.2s, opacity 0.2s;
                    padding: 0;
                }
                .wl-card--done { opacity: 0.65; }
                .wl-card:hover { border-color: #444; opacity: 1; }

                .wl-art {
                    position: relative;
                    width: 100px;
                    min-width: 100px;
                    background: #111;
                    overflow: hidden;
                }
                .wl-art img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .wl-art-placeholder {
                    width: 100%;
                    height: 100%;
                    min-height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: #555;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                }
                .wl-done-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: gold;
                }

                .wl-info {
                    flex: 1;
                    padding: 14px 14px 14px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .wl-badges { display: flex; gap: 6px; flex-wrap: wrap; }
                .wl-type-badge, .wl-status-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 20px;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }
                .badge-movie { background: #1a3a5c; color: #7ec8e3; }
                .badge-game  { background: #1a3a1a; color: #7ec87e; }
                .status-pending { background: #3a3a1a; color: #d4b96a; }
                .status-done    { background: #1a3a1a; color: #6ad47e; }

                .wl-title {
                    font-size: 0.95rem;
                    color: #fff;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 280px;
                }
                .wl-date { font-size: 0.75rem; color: #555; margin: 0; }

                .wl-actions { display: flex; gap: 8px; margin-top: auto; }
                .wl-btn {
                    border: none;
                    border-radius: 7px;
                    padding: 5px 12px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .wl-btn:disabled { opacity: 0.5; cursor: default; }
                .wl-btn-complete { background: gold; color: #111; }
                .wl-btn-undo     { background: #2a2a2a; color: #aaa; }
                .wl-btn-remove   {
                    background: transparent;
                    color: #c0392b;
                    border: 1px solid #c0392b;
                    padding: 5px 10px;
                }
                .wl-btn-remove:hover:not(:disabled) { background: #c0392b; color: #fff; }
            `}</style>
        </div>
    );
};

export default WatchlistCard;
