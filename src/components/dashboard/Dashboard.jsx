import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Container, Spinner, Alert } from 'react-bootstrap';

function Dashboard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'

    // Steam returns the ID at the end of the openid.claimed_id string, Format: https://steamcommunity.com/openid/id/69696967XXXXXXXXX
    const steamId = searchParams.get('steamid');

    useEffect(() => {
        const syncLibrary = async () => {
            if (steamId) {
                try {
                    console.log("Syncing library for SteamID:", steamId);
                    await api.post(`/api/v1/libraries/sync/${steamId}`);
                    setStatus('success');
                    localStorage.setItem("steamId", steamId);
                    
                    // Optional: Redirect to the Library page after 2 seconds
                    setTimeout(() => {
                        navigate('/steam');
                    }, 2000);
                } catch (err) {
                    console.error("Sync failed:", err);
                    setStatus('error');
                }
            } else {
                setStatus('error');
            }
        };

        syncLibrary();
    }, [steamId, navigate]);

    return (
        <Container className="text-center mt-5">
            {status === 'processing' && (
                <div>
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Authenticating with Steam and syncing your library...</p>
                </div>
            )}

            {status === 'success' && (
                <Alert variant="success">
                    Successfully authenticated! Redirecting to your library...
                </Alert>
            )}

            {status === 'error' && (
                <Alert variant="danger">
                    Failed to authenticate with Steam. Please try again.
                </Alert>
            )}
        </Container>
    );
}

export default Dashboard;