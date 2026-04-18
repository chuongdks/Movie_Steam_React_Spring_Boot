import axios from 'axios'
const apiBaseURL = process.env.REACT_APP_API_URL || 'https://manitoba-receptor-arrived-computing.trycloudflare.com'; // CloudFlare can change env and variable

export default axios.create({
    baseURL: apiBaseURL, // 172.21.176.1:8080 , https://9c96-103-106-239-104.ap.ngrok.io , 'http://<ec2-public-ip>:8080'
    headers: {"Content-Type": "application/json"} // ngrok is used to exposed the endpoint API / "Content-Type": "application/json" / "ngrok-skip-browser-warning": "true"
})