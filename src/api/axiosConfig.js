import axios from 'axios'

export default axios.create({
    baseURL:'http://3.235.120.28:8080', // 172.21.176.1:8080 , https://9c96-103-106-239-104.ap.ngrok.io , 'http://<ec2-public-ip>:8080'
    headers: {"Content-Type": "application/json"} // ngrok is used to exposed the endpoint API / "Content-Type": "application/json" / "ngrok-skip-browser-warning": "true"
})