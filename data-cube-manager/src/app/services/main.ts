import axios from "axios";

const instance = axios.create();

const urlCubeBuilder = localStorage.getItem('DC_MANAGER_url_service');

instance.interceptors.request.use((config) => {
  if (config.url && config.url.includes(urlCubeBuilder)) {
    const XApiKey: any = localStorage.getItem('DC_MANAGER_api_token');
    if (XApiKey) {
      config.headers['x-api-key'] = XApiKey
    }
  }
  return config;
});

export default instance;