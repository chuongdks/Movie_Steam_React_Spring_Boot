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

    // 1. Create a pure data fetching function
    const performSync = async (idToUse) => {
        if (!idToUse) return;
        
        setLoading(true);
        try {
            const response = await api.post(`/api/v1/libraries/sync/${idToUse}`);
            setGames(response.data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching Steam library:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle the manual form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();     // handles UI event
        performSync(steamId);   // handles data
    };

    // 3. Handle the automatic load on mount
    useEffect(() => {
        const savedId = localStorage.getItem("steamId");
        if (savedId) {
            setSteamId(savedId);
            performSync(savedId); // No 'e' needed here
        }
    }, []);

    // 1. FILTERING (Search)
    const filteredGames = games.filter((game) => 
        game.name.toLowerCase().includes(search.toLowerCase())
    );

    // 2. SORTING GAMES 
    const sortedGames = [...filteredGames].sort((a, b) => {
        if (sortType === 'name') {
            return a.name.localeCompare(b.name);            // Alphabetical
        } else if (sortType === 'playtime') {
            return b.playtime_forever - a.playtime_forever; // High to Low
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
            <header className="page-header text-center mb-5">
                <h1>Steam Library</h1>
                {games.length > 0 && (
                    <p className="text-muted">
                        {games.length} games · {totalHours.toLocaleString()} total hours played
                    </p>
                )}
            </header>

            <Row className="justify-content-center mb-4">
                <Col md={8}>
                    <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Search your library..."
                            value={search}
                            onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
                        />
                        {!localStorage.getItem("steamId") && (
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Sync ID'}
                            </Button>
                        )}
                    </Form>
                </Col>
            </Row>

            {games.length > 0 && (
                <div className="steam-controls d-flex justify-content-between align-items-center mb-4">
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
                </div>
            )}

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

            {sortedGames.length === 0 && !loading && (
                <p className="text-center mt-5 text-muted">No games found matching your search.</p>
            )}
        </Container>
    );
};

export default SteamLibrary;