import axios from 'axios'

export default axios.create({
    baseURL:'http://172.21.176.1:8080', // 172.21.176.1 / https://9c96-103-106-239-104.ap.ngrok.io
    headers: {"Content-Type": "application/json"} // ngrok is used to exposed the endpoint API / "Content-Type": "application/json" / "ngrok-skip-browser-warning": "true"
})