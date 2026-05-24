import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>  
                {/* WatchlistProvider is inside AuthProvider so it can read useAuth() to know when to fetch/clear the list */}
                <WatchlistProvider>
                    <Routes>
                        <Route path="/*" element={ <App/> }/>  
                    </Routes>
                </WatchlistProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
