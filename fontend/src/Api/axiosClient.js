import axios from "axios";
import queryString from "query-string";

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL,
    paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(
    async (config) => {
        let access_token = sessionStorage.getItem("access_token");
        if (access_token)
            config.headers["Authorization"] = `Bearer ${access_token}`;
        return config;
    },
    (error) => {
        throw error;
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        //handle error
        throw error;
    }
);

export default axiosClient;
