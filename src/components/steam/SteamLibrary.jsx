import { useState } from 'react';
import api from '../../api/axiosConfig'; // Using your existing axios instance
import { Container, Row, Col, Form, Button, ListGroup, Image } from 'react-bootstrap';

const SteamLibrary = () => {
    const [steamId, setSteamId] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 30;
    
    const fetchLibrary = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Adjust the endpoint to match your Java Controller
            const response = await api.post(`/api/v1/libraries/sync/${steamId}`);
            setGames(response.data);
            console.log("Steam Data:", response.data);
        } catch (err) {
            console.error("Error fetching Steam library:", err);
        } finally {
            setLoading(false);
        }
    };

    // Logic to calculate the subset of games to display
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = games?.slice(indexOfFirstGame, indexOfLastGame);

    // Determine total pages
    const totalPages = Math.ceil((games?.length || 0) / gamesPerPage);

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h3>Steam Library Lookup</h3>
                    <Form onSubmit={fetchLibrary} className="d-flex mb-4">
                        <Form.Control
                            type="text"
                            placeholder="Enter Steam ID (e.g., 76561198...)"
                            value={steamId}
                            onChange={(e) => setSteamId(e.target.value)}
                        />
                        <Button variant="primary" type="submit" className="ms-2" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </Form>

                    <ListGroup>
                        {currentGames?.map((game) => (
                            <ListGroup.Item key={game.appid} className="d-flex align-items-center">
                                {/* Construction of the Steam Icon URL */}
                                <Image 
                                    src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} 
                                    rounded 
                                    className="me-3"
                                    style={{ width: '32px', height: '32px' }}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }} // Fallback if icon is missing
                                />
                                <div>
                                    <strong>{game.name}</strong>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        App ID: {game.appid}
                                    </div >
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* Pagination Controls */}
                    {games.length > gamesPerPage && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Button 
                                variant="secondary" 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </Button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <Button 
                                variant="secondary" 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default SteamLibrary;