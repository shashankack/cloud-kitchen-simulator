import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

import progressService from "../utils/progressService";

let activeRequests = 0;

const tryStart = () => {
  activeRequests += 1;
  if (activeRequests === 1) progressService.start(8);
};

const tryFinish = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) progressService.finish();
  else progressService.update(30);
};

axiosClient.interceptors.request.use(
  (cfg) => {
    tryStart();
    return cfg;
  },
  (err) => {
    tryFinish();
    return Promise.reject(err);
  },
);

axiosClient.interceptors.response.use(
  (res) => {
    tryFinish();
    return res;
  },
  (err) => {
    tryFinish();
    return Promise.reject(err);
  },
);

export default axiosClient;
