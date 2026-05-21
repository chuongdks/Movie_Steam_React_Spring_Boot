import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideoSlash, faUser, faRightFromBracket, faCalendarXmark }  from "@fortawesome/free-solid-svg-icons";
import { faLink, faLinkSlash } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/AuthContent';
import AuthModal from '../auth/AuthModal';


const Header = () => {
    const { user, logout, unlinkSteam } = useAuth();
    const [modalTab, setModalTab]       = useState(null); // null | 'login' | 'register'
    const [unlinking, setUnlinking]     = useState(false);

    const openLogin    = () => setModalTab('login');
    const openRegister = () => setModalTab('register');
    const closeModal   = () => setModalTab(null);

    // Redirect to backend which starts the Steam OpenID flow for linking
    const handleLinkSteam = () => {
        window.location.href = `http://localhost:8080/api/v1/auth/steam/link?username=${user.username}`;
    };

    const handleUnlinkSteam = async () => {
        if (!window.confirm('Unlink your Steam account?')) return;
        setUnlinking(true);
        try {
            await unlinkSteam(user.username);
        } catch (err) {
            console.error('Failed to unlink Steam:', err);
        } finally {
            setUnlinking(false);
        }
    };
    
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="/" style={{ color: 'gold' }}>
                        <FontAwesomeIcon icon={faVideoSlash} /> Gold
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <NavLink className="nav-link" to="/">Home</NavLink>
                            <NavLink className="nav-link" to="/watchList">Watch List</NavLink>
                            <NavLink className="nav-link" to="/steam">Steam Library</NavLink>
                        </Nav>

                        {/* ── Auth area ──────────────────────────────────────── */}
                        {user ? (
                            /* Logged-in: show username + logout dropdown */
                            <NavDropdown
                                title={
                                    <span style={{ color: 'gold' }}>
                                        <FontAwesomeIcon icon={faUser} className="me-1" />
                                        {user.username}
                                        {/* Small Steam badge when linked */}
                                        {user.steamId && (
                                            <FontAwesomeIcon
                                                icon={faCalendarXmark}
                                                className="ms-2"
                                                style={{ color: '#c6d4df', fontSize: '0.85em' }}
                                                title="Steam linked"
                                            />
                                        )}
                                    </span>
                                }
                                id="user-dropdown"
                                align="end"
                                menuVariant="dark"
                            >
                                {/* Steam link/unlink — conditional on whether steamId exists */}
                                {!user.steamId ? (
                                    <NavDropdown.Item onClick={handleLinkSteam}>
                                        <FontAwesomeIcon icon={faLink} className="me-2" style={{ color: '#c6d4df' }} />
                                        Link Steam Account
                                    </NavDropdown.Item>
                                ) : (
                                    <NavDropdown.Item
                                        onClick={handleUnlinkSteam}
                                        disabled={unlinking}
                                        className="text-danger-emphasis"
                                    >
                                        <FontAwesomeIcon icon={faLinkSlash} className="me-2" />
                                        {unlinking ? 'Unlinking...' : 'Unlink Steam'}
                                    </NavDropdown.Item>
                                )}

                                <NavDropdown.Divider />

                                <NavDropdown.Item onClick={logout}>
                                    <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            /* Logged-out: Login + Register + Steam SSO */
                            <div className="d-flex align-items-center gap-2">
                                <Button variant="outline-warning" size="sm" onClick={openLogin}>
                                    Login
                                </Button>
                                <Button variant="outline-info" size="sm" onClick={openRegister}>
                                    Register
                                </Button>
                                {/* Steam SSO — goes straight to backend redirect */}
                                <button
                                    onClick={() => { window.location.href = 'http://localhost:8080/api/v1/auth/login'; }}
                                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                    title="Sign in through Steam"
                                >
                                    <img
                                        src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png"
                                        alt="Sign in through Steam"
                                    />
                                </button>
                            </div>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Auth Modal — rendered once, controlled by modalTab state */}
            <AuthModal
                show={modalTab !== null} // Change the Modal's "show: boolean in AuthModal.jsx (true -> show)
                onHide={closeModal}
                defaultTab={modalTab ?? 'login'}
            />
        </>
    );
}

export default Header
