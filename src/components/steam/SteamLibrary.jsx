import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { Container, Row, Col, Form, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import './SteamLibrary.css';
import api, { getSteamLinkUrl, getSteamLoginUrl } from '../../api/axiosConfig';

const SteamLibrary = () => {
    const location                          = useLocation();    // Access passed state
    const [searchParams, setSearchParams]   = useSearchParams();
    const { user, updateSteamId }           = useAuth();
    const navigate = useNavigate();
    const { addItem, removeItem, isInWatchlist } = useWatchlist();

    const [steamId, setSteamId]             = useState('');
    const [games, setGames]                 = useState(location.state?.initialGames || []);
    const [loading, setLoading]             = useState(false);
    const [linkAlert, setLinkAlert]         = useState(null); // { type: 'success'|'danger', message }

    const [sortType, setSortType]           = useState('name'); // 'name', 'playtime'
    const [search, setSearch]               = useState('');
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage                  = 20;               // Grid layout (4x5 or 5x4)

    // ── Handle Steam link-callback redirect ───────────────────────────────────
    // After linking, backend redirects to /steam?linked=true&steamid=XXX
    // search/read those params once, update auth context, then clean the URL
    useEffect(() => {
        const linked  = searchParams.get('linked');
        const newSteamId = searchParams.get('steamid');

        if (linked === 'true' && newSteamId) {
            // Update the user object in AuthContext + localStorage
            updateSteamId(newSteamId);
            localStorage.setItem('steamId', newSteamId);
            setLinkAlert({ type: 'success', message: 'Steam account linked successfully!' });

            // Clean the URL so a refresh doesn't re-trigger this
            setSearchParams({}, { replace: true });

            // Sync the library with the newly linked steamId
            performSync(newSteamId);
        } else if (linked === 'false') {
            const reason = searchParams.get('reason') || 'Steam linking failed. Please try again.';
            setLinkAlert({ type: 'danger', message: decodeURIComponent(reason) });
            setSearchParams({}, { replace: true });
        }
    }, []); // run once on mount

    // ── Auto-load on refresh / direct navigation ──────────────────────
    useEffect(() => {
        const savedId = localStorage.getItem("steamId");
        // Sync if: Page didn't come from Dashboard, or When user hit F5
        if (savedId && games.length === 0) {
            performSync(savedId);
        }
    }, []);

    // ── HELPER METHODS ──────────────────────────────────────────────────────────────────
    // Sync library from the back end
    const performSync = async (id) => {
        if (!id) return;
        
        setLoading(true);
        try {
            const response = await api.post(`/api/v1/libraries/sync/${id}`);
            setGames(response.data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching Steam library:", err);
        } finally {
            setLoading(false);
        }
    };

    // Check if item is in a WatchList
    const handleWatchlist = async (game) => {
        const entityId = String(game.appid);
        const imgUrl   = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;

        if (isInWatchlist(entityId)) {
            await removeItem(entityId);
        } else {
            await addItem({
                entityId,
                entityType: 'GAME',
                title:      game.name,
                posterUrl:  imgUrl,
            });
        }
    };

    // ── Filter → Sort → Paginate ──────────────────────────────────────────────
    // 1. FILTERING (Search)
    const filteredGames = games.filter((game) => 
        game.name.toLowerCase().includes(search.toLowerCase())
    );

    // 2. SORTING GAMES BY...
    const sortedGames = [...filteredGames].sort((a, b) => {
        if (sortType === 'name') {
            return a.name.localeCompare(b.name);            // Alphabetical
        } else if (sortType === 'playtime') {
            return b.playtime_forever - a.playtime_forever; // Total Play Time
        }
    });

    // 3. PAGINATION (Apply to the sorted/filtered list)
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = sortedGames?.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil((sortedGames?.length || 0) / gamesPerPage);
    // Statistical calculation stuff here
    const totalHours = Math.round(games.reduce((acc, g) => acc + g.playtime_forever, 0) / 60);

    return (
        <Container className="steam-library mt-5">
            {/* Link feedback banner */}
            {linkAlert && (
                <Alert
                    variant={linkAlert.type}
                    dismissible
                    onClose={() => setLinkAlert(null)}
                    className="mb-4"
                >
                    {linkAlert.message}
                </Alert>
            )}

            {/* Loading spinner */}
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading your library...</p>
                </div>
            )}

            {/* SECTION A: No Steam ID yet — show login options */}
            {!loading && !localStorage.getItem('steamId') && games.length === 0 && (
                <div className="text-center mb-5">
                    {/* If logged in with a normal account, show Link Steam instead */}
                    {user ? (
                        <>
                            <p className="text-muted mb-3">Link your Steam account to view your library.</p>

                            <Button variant="dark" onClick={() => { window.location.href = getSteamLinkUrl(user.username); }} > 
                                <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png" alt="Link Steam Account"/>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="dark" onClick={() => { window.location.href = getSteamLoginUrl(); }}>
                                <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png" alt="Sign in through Steam"/>
                            </Button>

                            <p className="mt-3 text-muted">Or enter your Steam ID manually:</p>

                            <Form onSubmit={(e) => { e.preventDefault(); performSync(steamId); }} className="d-flex justify-content-center gap-2">
                                <Form.Control
                                    style={{ maxWidth: '300px' }}
                                    placeholder="76561198..."
                                    value={steamId}
                                    onChange={(e) => setSteamId(e.target.value)}
                                />
                                <Button type="submit">Sync</Button>
                            </Form>
                        </>
                    )}
                </div>
            )}

            {/* SECTION B: LIBRARY CONTROLS (Only show if games exist) */}
            {!loading && games.length > 0 && (
                <>
                    {/* Stats bar */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                        <span className="text-muted">
                            <strong className="text-white">{games.length}</strong> games &nbsp;·&nbsp;
                            <strong className="text-white">{totalHours.toLocaleString()}</strong> hrs total
                        </span>

                        <ButtonGroup>
                            <Button variant={sortType === 'playtime' ? 'primary' : 'outline-primary'} onClick={() => setSortType('playtime')}>Most Played</Button>
                            <Button variant={sortType === 'name'     ? 'primary' : 'outline-primary'} onClick={() => setSortType('name')}>A–Z</Button>
                        </ButtonGroup>
                    </div>

                    <Row className="mb-4">
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="Search your library..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </Col>
                    </Row>

                    
                    {/* GRID DISPLAY */}
                    <div className="game-grid">
                        {currentGames.map(game => {
                            const hours    = Math.round(game.playtime_forever / 60);
                            const imgUrl   = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
                            const entityId = String(game.appid);
                            const inList   = isInWatchlist(entityId);

                            return (
                                <div key={game.appid} className="game-card-wrapper">
                                    {/* Game info display */}
                                    <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noopener noreferrer" className="game-card">
                                        <div className="game-art">
                                            <img src={imgUrl} alt={game.name} loading="lazy" onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('no-art'); }} />
                                        </div>
                                        <div className="game-info">
                                            <h3 className="game-name">{game.name}</h3>
                                            <span className="game-hours">{hours > 0 ? `${hours.toLocaleString()} hrs` : '< 1 hr'}</span>
                                            {/* Game tag here in the future */}
                                        </div>
                                    </a>

                                    {/* Watchlist button — only for logged-in users */}
                                    {/* Reviews button — always visible */}
                                    <button
                                        className="game-reviews-btn"
                                        onClick={() => navigate(`/reviews/${entityId}`, { state: { title: game.name, posterUrl: imgUrl, entityType: 'GAME' } })}
                                    >
                                        Reviews
                                    </button>

                                    {user && ( 
                                        <button
                                            className={`game-wl-btn ${inList ? 'game-wl-btn--saved' : ''}`}
                                            onClick={() => handleWatchlist(game)}
                                            title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                        >
                                            {inList ? '🔖' : '＋'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* PAGINATION */}
                    {sortedGames.length > gamesPerPage && (
                        <div className="d-flex justify-content-center align-items-center mt-5 mb-5 gap-3">
                            <Button variant="outline-secondary" disabled={currentPage === 1}            onClick={() => setCurrentPage(prev => prev - 1)}> Previous </Button>
                            <span className="fw-bold">Page {currentPage} of {totalPages}</span>
                            <Button variant="outline-secondary" disabled={currentPage === totalPages}   onClick={() => setCurrentPage(prev => prev + 1)}> Next </Button>
                        </div>
                    )}

                    {/* NO GAME FOUND */}
                    {sortedGames.length === 0 && !loading && ( <p className="text-center mt-5 text-muted">No games found matching your search.</p> )}
                </>
            )}

            <style>{`
                .game-card-wrapper {
                    position: relative;
                }
                .game-wl-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(0,0,0,0.7);
                    color: #fff;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                    z-index: 2;
                }
                .game-card-wrapper:hover .game-wl-btn { opacity: 1; }
                .game-wl-btn--saved { opacity: 1; background: rgba(255,215,0,0.85); }
                .game-reviews-btn {
                    position: absolute;
                    bottom: 8px;
                    left: 0;
                    right: 0;
                    margin: 0 8px;
                    padding: 4px 0;
                    border-radius: 6px;
                    border: none;
                    background: rgba(0,0,0,0.75);
                    color: #c6d4df;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .game-card-wrapper:hover .game-reviews-btn { opacity: 1; }
            `}</style>
        </Container>
    );
};

export default SteamLibrary;
