import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideoSlash, faUser, faRightFromBracket }  from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/AuthContent';
import AuthModal from '../auth/AuthModal';


const Header = () => {
    const { user, logout } = useAuth();
    const [modalTab, setModalTab] = useState(null); // null | 'login' | 'register'

    const openLogin    = () => setModalTab('login');
    const openRegister = () => setModalTab('register');
    const closeModal   = () => setModalTab(null);

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
                                    </span>
                                }
                                id="user-dropdown"
                                align="end"
                                menuVariant="dark"
                            >
                                {/* Future: profile, settings links go here */}
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
                show={modalTab !== null} // Change the Modal's show boolean in AuthModal.jsx (true -> show)
                onHide={closeModal}
                defaultTab={modalTab ?? 'login'}
            />
        </>
    );
}

export default Header
