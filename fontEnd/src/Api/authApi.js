import axios from "axios";
import axiosClient from "./axiosClient";

const authApi = {
    test: async () => {
        console.log(process.env);
        return axiosClient.get("/posts");
    },

    register: async (body) => {
        return axiosClient.post("/api/users/register", body, {
            headers: { "Content-type": "application/json" },
        });
    },

    verifyEmailRegister: async (email) => {
        return axiosClient.post(`/api/users/register/verify-email/${email}`);
    },

    login: async (body) => {
        return axiosClient.post("/api/users/login", body);
    },

    sendOTP: async (email) => {
        return axiosClient.post(`/api/users/email/otp/${email}`);
    },

    forgotPassword: async (body) => {
        return axiosClient.post("/api/users/forgot-password", body);
    },

    refreshToken: async () => {
        const refresh_token = sessionStorage.getItem("refresh_token");
        if (!refresh_token) return false;
        try {
            const response = await axiosClient.post(
                "/api/users/refresh-token",
                null,
                {
                    headers: { refresh_token },
                }
            );
            sessionStorage.setItem(
                "access_token",
                response.data.data.access_token
            );
            return true;
        } catch (error) {
            console.log(error.response.data);
            return false;
        }
    },

    updateEmail: async (data) => {
        return axiosClient.put("/api/users/email", data);
    },
};

export default authApi;
