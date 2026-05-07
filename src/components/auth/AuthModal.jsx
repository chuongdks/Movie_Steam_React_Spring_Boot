import { useState, useRef, useEffect } from 'react';
import { Modal, Tab, Nav, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContent';
import myStyles from './AuthModal.css?inline';

/**
 * 
 * @props {*}  
 *   show        {boolean}  — controlled by Header (for the Modal)
 *   onHide      {function} — close the modal (for the Modal)
 *   defaultTab  {'login'|'register'} — which tab to open first (for the Nav)
 * @returns 
 */
const AuthModal = ({ show, onHide, defaultTab }) => {
    const { login, register } = useAuth();

    // ── Form state ────────────────────────────────────────────────────────────
    const [activeTab,  setActiveTab]  = useState(defaultTab);   // defaultTab: 'login' | 'register'
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');
    const [success,    setSuccess]    = useState('');

    // Login fields
    const [loginUser,  setLoginUser]  = useState('');
    const [loginPass,  setLoginPass]  = useState('');

    // Register fields
    const [regUser,    setRegUser]    = useState('');
    const [regEmail,   setRegEmail]   = useState('');
    const [regPass,    setRegPass]    = useState('');
    const [regConfirm, setRegConfirm] = useState('');

    // ── Helper Functions ───────────────────────────────────────────────────────
    const clearMessages = () => { 
        setError(''); 
        setSuccess(''); 
    };

    const resetAll = () => {
        setLoginUser(''); setLoginPass('');
        setRegUser(''); setRegEmail(''); setRegPass(''); setRegConfirm('');
        clearMessages();
        setLoading(false);
    };

    const handleClose = () => { 
        resetAll(); 
        onHide(); 
    };

    const switchTab = (tab) => { 
        setActiveTab(tab); 
        clearMessages(); 
    };

    // ── Submit Form: Login (AuthContent.jsx usage) ──────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        clearMessages();

        if (!loginUser || !loginPass) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await login(loginUser, loginPass);
            setSuccess('Welcome back! Closing...');
            setTimeout(handleClose, 1000);
        } catch (err) {
            // Spring Boot typically returns { message } on 401/400
            setError(err.response?.data?.message || 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    // ── Submit: Register (AuthContent.jsx usage) ───────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        clearMessages();
        
        // Put more bs user name / password requirement here
        if (!regUser || !regEmail || !regPass || !regConfirm) {
            setError('Please fill in all fields.');
            return;
        }
        if (regPass !== regConfirm) {
            setError('Passwords do not match.');
            return;
        }
        if (regPass.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await register(regUser, regEmail, regPass);
            setSuccess('Account created! Welcome aboard');
            setTimeout(handleClose, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try a different username or email.');
        } finally {
            setLoading(false);
        }
    };

    // ── Steam login (use the steam login back end) ─────────────────────────────────────────
    const handleSteamLogin = () => {
        window.location.href = 'http://localhost:8080/api/v1/auth/login';
    };
    // Inside the AuthModal component:
    useEffect(() => {
        if (show) {
            setActiveTab(defaultTab);
        }
    }, [show, defaultTab]);
    
    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            contentClassName="auth-modal-content"
        >
            <Modal.Header closeButton closeVariant="white" className="auth-modal-header border-0 pb-0">
                {/* Tab switcher lives in the header */}
                <Nav variant="tabs" activeKey={activeTab} onSelect={switchTab} className="w-100 border-0">
                    <Nav.Item>
                        <Nav.Link eventKey="login"    className="auth-tab">Login</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="register" className="auth-tab">Register</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Modal.Header>

            <Modal.Body className="auth-modal-body pt-3">

                {/* ── ALERT FEEDBACK ── */}
                {error   && <Alert variant="danger"  className="py-2 text-center small">{error}</Alert>}
                {success && <Alert variant="success" className="py-2 text-center small">{success}</Alert>}

                {/* ── LOGIN TAB ── */}
                {activeTab === 'login' && (
                    <Form onSubmit={handleLogin} noValidate>
                        <Form.Group className="mb-3">
                            <Form.Label className="auth-label">Username</Form.Label>
                            <Form.Control
                                className="auth-input"
                                type="text"
                                placeholder="User Name or E-mail"
                                value={loginUser}
                                onChange={e => setLoginUser(e.target.value)}
                                autoComplete="username"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="auth-label">Password</Form.Label>
                            <Form.Control
                                className="auth-input"
                                type="password"
                                placeholder="Password"
                                value={loginPass}
                                onChange={e => setLoginPass(e.target.value)}
                                autoComplete="current-password"
                            />
                        </Form.Group>

                        <Button type="submit" className="auth-submit-btn w-100 mb-3" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : 'Login'}
                        </Button>

                        <div className="auth-divider"><span>or</span></div>

                        {/* Steam Login Method */}
                        <div className="text-center mt-3">
                            <button
                                type="button"
                                onClick={handleSteamLogin}
                                className="steam-sso-btn"
                            >
                                <img
                                    src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png"
                                    alt="Sign in through Steam"
                                />
                            </button>
                        </div>

                        <p className="text-center mt-3 auth-switch-text">
                            No account?{' '}
                            <button type="button" className="auth-link-btn" onClick={() => switchTab('register')}>
                                Register here
                            </button>
                        </p>
                    </Form>
                )}

                {/* ── REGISTER TAB ── */}
                {activeTab === 'register' && (
                    <Form onSubmit={handleRegister} noValidate>
                        <Form.Group className="mb-3">
                            <Form.Label className="auth-label">Username</Form.Label>
                            <Form.Control
                                className="auth-input"
                                type="text"
                                placeholder="Your User Name"
                                value={regUser}
                                onChange={e => setRegUser(e.target.value)}
                                autoComplete="username"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="auth-label">Email</Form.Label>
                            <Form.Control
                                className="auth-input"
                                type="email"
                                placeholder="Your Email"
                                value={regEmail}
                                onChange={e => setRegEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="auth-label">Password</Form.Label>
                            <Form.Control
                                className="auth-input"
                                type="password"
                                placeholder="Enter Password"
                                value={regPass}
                                onChange={e => setRegPass(e.target.value)}
                                autoComplete="new-password"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="auth-label">Confirm Password</Form.Label>
                            <Form.Control
                                className="auth-input"
                                type="password"
                                placeholder="Re-enter Password"
                                value={regConfirm}
                                onChange={e => setRegConfirm(e.target.value)}
                                autoComplete="new-password"
                            />
                        </Form.Group>

                        <Button type="submit" className="auth-submit-btn w-100" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : 'Create An Account'}
                        </Button>

                        <p className="text-center mt-3 auth-switch-text">
                            Already have an account?{' '}
                            <button type="button" className="auth-link-btn" onClick={() => switchTab('login')}>
                                Login here
                            </button>
                        </p>
                    </Form>
                )}
            </Modal.Body>
            {/* ── Inline styles scoped to this modal ── */}
            <style>{myStyles}</style>
        </Modal>
    );
};

export default AuthModal;
