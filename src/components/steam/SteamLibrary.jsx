import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; // Using your existing axios instance
import { Container, Row, Col, Form, Button, Spinner, ButtonGroup } from 'react-bootstrap';
import './SteamLibrary.css';

const SteamLibrary = () => {
    const [steamId, setSteamId]     = useState('');
    const [games, setGames]         = useState([]);
    const [loading, setLoading]     = useState(false);
    const [sortType, setSortType]   = useState('name'); // 'name', 'playtime'
    const [search, setSearch]       = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 20; // Grid layout (4x5 or 5x4)

    // Automatic Load steam id on Mount
    useEffect(() => {
        const savedId = localStorage.getItem("steamId");
        if (savedId) {
            // setSteamId(savedId);
            performSync(savedId); 
        }
    }, []);

    // Create a pure data fetching function
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

    // 1. FILTERING (Search)
    const filteredGames = games.filter((game) => 
        game.name.toLowerCase().includes(search.toLowerCase())
    );

    // 2. SORTING GAMES 
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

    // Statistical calculation 
    const totalHours = Math.round(
        games.reduce((acc, g) => acc + g.playtime_forever, 0) / 60
    );

    return (
        <Container className="steam-library mt-5">
            {/* SECTION A: AUTH/SYNC (Only show if not logged in before) */}
            {!localStorage.getItem("steamId") && (
                <div className="text-center mb-5">
                    <Button href="http://localhost:8080/api/v1/auth/login" variant="dark">
                        <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png" alt="Steam Login" />
                    </Button>
                    <p className="mt-2 text-muted">Or enter Steam ID manually:</p>
                    <Form onSubmit={(e) => { e.preventDefault(); performSync(steamId); }} className="d-flex justify-content-center gap-2">
                        <Form.Control 
                            style={{ maxWidth: '300px' }}
                            placeholder="76561198..." 
                            value={steamId} 
                            onChange={(e) => setSteamId(e.target.value)} 
                        />
                        <Button type="submit">Sync</Button>
                    </Form>
                </div>
            )}

            {/* SECTION B: LIBRARY CONTROLS (Only show if games exist) */}
            {games.length > 0 && (
                <>
                <Row className="mb-4">
                    <Col md={8}>
                        <Form.Control
                            type="text"
                            placeholder="Search games in your library..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); } } />
                    </Col>
                    <Col md={4} className="text-end">
                        <ButtonGroup>
                            <Button 
                                variant={sortType === 'playtime' ? 'primary' : 'outline-primary'} 
                                onClick={() => setSortType('playtime')}
                            >Most Played</Button>
                            <Button 
                                variant={sortType === 'name' ? 'primary' : 'outline-primary'} 
                                onClick={() => setSortType('name')}
                            >A–Z</Button>
                        </ButtonGroup>
                    </Col>
                </Row>
                
                
                {/* GRID DISPLAY */}
                <div className="game-grid">
                    {currentGames.map(game => {
                        const hours = Math.round(game.playtime_forever / 60);
                        const imgUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;

                        return (
                            <a key={game.appid} href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noopener noreferrer" className="game-card">
                                <div className="game-art">
                                    <img src={imgUrl} alt={game.name} loading="lazy" onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('no-art'); }} />
                                </div>
                                <div className="game-info">
                                    <h3 className="game-name">{game.name}</h3>
                                    <span className="game-hours">{hours > 0 ? `${hours.toLocaleString()} hrs` : '< 1 hr'}</span>
                                </div>
                            </a>
                        );
                    })}
                </div>

                {/* PAGINATION */}
                {sortedGames.length > gamesPerPage && (
                    <div className="d-flex justify-content-center align-items-center mt-5 mb-5 gap-3">
                        <Button variant="outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                            Previous
                        </Button>
                        <span className="fw-bold">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                            Next
                        </Button>
                    </div>
                )}

                {/* NO GAME FOUND */}
                {sortedGames.length === 0 && !loading && (
                    <p className="text-center mt-5 text-muted">No games found matching your search.</p>
                )}
                </>
            )}
        </Container>
    );
};

export default SteamLibrary;