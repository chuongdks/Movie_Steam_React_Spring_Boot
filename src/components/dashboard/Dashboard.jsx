import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Container, Spinner, Alert } from 'react-bootstrap';

function Dashboard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // success, error, processing

    // Extract the clean 17-digit ID provided by the back end in the url (?steamid=XXXXXXXXXXXXXX)
    const steamId = searchParams.get('steamid');

    useEffect(() => {
        const finalizeLogin = async () => {
            if (!steamId) {
                console.error("No SteamID found in redirect URL");
                setStatus('error');
                return;
            }

            try {
                console.log("Finalizing login for SteamID:", steamId);
                
                // 1. Sync steam library to the database
                await api.post(`/api/v1/libraries/sync/${steamId}`);
                
                // 2. Persist the ID so SteamLibrary.jsx can auto-load on refresh
                localStorage.setItem("steamId", steamId);
                
                setStatus('success');

                // 3. Navigate to the Library after a brief success message
                setTimeout(() => {
                    navigate('/steam');
                }, 1500);

            } catch (err) {
                console.error("Backend synchronization failed:", err);
                setStatus('error');
            }
        };

        finalizeLogin();
    }, [steamId, navigate]);

    return (
        <Container className="text-center mt-5" style={{ minHeight: '50vh' }}>
            {status === 'processing' && (
                <div className="py-5">
                    <Spinner animation="border" variant="primary" size="lg" />
                    <h3 className="mt-4">Synchronizing Library</h3>
                    <p className="text-muted">We are fetching your latest Steam data...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-5">
                    <Alert variant="success" className="d-inline-block px-5">
                        <Alert.Heading>Success!</Alert.Heading>
                        <p>Your library is ready. Redirecting you now...</p>
                    </Alert>
                </div>
            )}

            {status === 'error' && (
                <div className="py-5">
                    <Alert variant="danger" className="d-inline-block px-5">
                        <Alert.Heading>Authentication Error</Alert.Heading>
                        <p>We couldn't verify your Steam account or sync the data.</p>
                        <hr />
                        <div className="d-flex justify-content-center">
                            <button 
                                className="btn btn-outline-danger" 
                                onClick={() => navigate('/steam')}
                            >
                                Back to Library
                            </button>
                        </div>
                    </Alert>
                </div>
            )}
        </Container>
    );
}

export default Dashboard;