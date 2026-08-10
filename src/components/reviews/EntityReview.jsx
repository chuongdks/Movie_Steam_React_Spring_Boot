import { useEffect, useRef, useState } from "react";
import api from '../../api/axiosConfig.js';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import ReviewForm from '../reviewForm/ReviewForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Unified review page for both movies and games.
 *
 * Route params:
 *   entityId  — imdbId for movies, appid (string) for games
 *
 * location.state (passed from Hero or SteamLibrary):
 *   { title, posterUrl, entityType: 'MOVIE' | 'GAME' }
 */
const EntityReview = () => {
    const { entityId } = useParams();
    const { state }    = useLocation();       // { title, posterUrl, entityType }
    const { user }     = useAuth();

    const revText = useRef();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const title      = state?.title     || entityId;
    const posterUrl  = state?.posterUrl || null;
    const entityType = state?.entityType || 'MOVIE';

    // ── Fetch existing reviews on mount ───────────────────────────────────────
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get(`/api/v1/reviews/${entityId}`);
                setReviews(response.data);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [entityId]);

    // ── Submit a new review ───────────────────────────────────────────────────
    const addReview = async (e) => {
        e.preventDefault();
        setError('');
        const rev = revText.current;

        if (!rev.value.trim()) {
            setError('Review cannot be empty.');
            return;
        }

        try {
            await api.post('/api/v1/reviews', {
                reviewBody: rev.value,
                imdbId:     entityId,   // backend key is still "imdbId" for both types
            });
            setReviews(prev => [...prev, { body: rev.value }]);
            rev.value = '';
        } catch (err) {
            console.error(err);
            setError('Failed to submit review. Please try again.');
        }
    };

    return (
        <Container className="mt-4 pb-5">

            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <span className={`badge me-2 ${entityType === 'GAME' ? 'bg-success' : 'bg-primary'}`}>
                        {entityType === 'GAME' ? '🎮 Game' : '🎬 Movie'}
                    </span>
                    <h3 className="d-inline">{title}</h3>
                </Col>
            </Row>

            <Row>
                {/* Poster / Art */}
                <Col md={3} className="mb-4">
                    {posterUrl
                        ? <img
                            src={posterUrl}
                            alt={title}
                            style={{ width: '100%', borderRadius: '10px', border: '1px solid gold' }}
                          />
                        : <div style={{
                            width: '100%', aspectRatio: '2/3',
                            background: '#1a1a1a', borderRadius: '10px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#555', fontSize: '3rem'
                          }}>
                            {entityType === 'GAME' ? '🎮' : '🎬'}
                          </div>
                    }
                </Col>

                {/* Reviews panel */}
                <Col md={9}>
                    {/* Write a review — only for logged-in users */}
                    {user ? (
                        <>
                            <ReviewForm
                                handleSubmit={addReview}
                                revText={revText}
                                labelText={`Write a review for ${title}`}
                            />
                            {error && <p className="text-danger mt-2 small">{error}</p>}
                            <hr />
                        </>
                    ) : (
                        <p className="text-muted mb-4">
                            <a href="/" style={{ color: 'gold' }}>Login</a> to write a review.
                        </p>
                    )}

                    {/* Review list */}
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="secondary" size="sm" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-muted">
                            No reviews yet. {user ? 'Be the first!' : ''}
                        </p>
                    ) : (
                        reviews.map((review, index) => (
                            <Row key={index} className="mb-3">
                                <Col>
                                    <div style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        color: '#ddd'
                                    }}>
                                        {review.body}
                                    </div>
                                </Col>
                            </Row>
                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default EntityReview;
