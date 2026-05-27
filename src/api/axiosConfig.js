import axios from 'axios'
export const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'; // CloudFlare can change env and variable

const api = axios.create({
    baseURL: apiBaseURL , // http://172.21.176.1:8080, https://9c96-103-106-239-104.ap.ngrok.io , 'http://<ec2-public-ip>:8080' , apiBaseURL
    headers: {"Content-Type": "application/json"} // ngrok is used to exposed the endpoint API / "Content-Type": "application/json" / "ngrok-skip-browser-warning": "true"
})

// Dynamic helper functions for full page authentication redirects
export const getSteamLoginUrl = () => `${BACKEND_BASE_URL}/api/v1/auth/login`;
export const getSteamLinkUrl = (username) => `${BACKEND_BASE_URL}/api/v1/auth/steam/link?username=${encodeURIComponent(username)}`;

export default api;