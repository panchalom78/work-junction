import axios from "axios";

// Use proxy in development, direct URL in production
const getBaseURL = () => {
    
    // In production, use full URL
    return "http://localhost:3000";
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for debugging


export default axiosInstance;
