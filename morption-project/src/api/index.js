import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://morpion-api.edu.netlor.fr',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setApiKey = (apiKey) => {
  instance.defaults.headers.common['Authorization'] = `key=${apiKey}`;
};

export default instance;
