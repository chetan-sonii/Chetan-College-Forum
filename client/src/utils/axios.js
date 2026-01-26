import axios from "axios";

const instance = axios.create({
  // Use Vite environment variable, fallback to localhost for safety
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 10000,
});

instance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      if (err.response) {
        // Check for 401 and ensure we haven't already tried to retry
        if (err.response.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true;

          try {
            // Attempt to get a new access token
            const { data } = await instance.get("/refresh_token");

            // Update the default header for future requests
            instance.defaults.headers.common[
                "Authorization"
                ] = `Bearer ${data.token}`;

            // Update the failed request's header and retry it
            originalConfig.headers["Authorization"] = `Bearer ${data.token}`;

            return instance(originalConfig);
          } catch (_error) {
            // If refresh fails, reject cleanly
            if (_error.response && _error.response.data) {
              return Promise.reject(_error.response.data);
            }
            return Promise.reject(_error);
          }
        }
      }

      return Promise.reject(err);
    }
);

export default instance;