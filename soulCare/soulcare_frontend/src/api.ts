import axios from 'axios';

// Create a central axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/auth/",
});

export default axiosInstance;