import axios from 'axios';

const API = axios.create({
  baseURL: 'https://note-taking-app-kf3o.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;