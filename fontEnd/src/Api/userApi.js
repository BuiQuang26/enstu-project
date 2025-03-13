import axiosClient from "./axiosClient";

const userApi = {
    getUserById: async (userID) => {
        return axiosClient.get(`/api/users/id/${userID}`);
    },

    updateInfo: async (body) => {
        return axiosClient.put(`/api/users/info`, body);
    },

    updateAvatar: async (formData) => {
        return axiosClient.post("/api/users/avatar", formData);
    },

    updatePassword: async (body) => {
        return axiosClient.put("/api/users/password", body);
    },
};

export default userApi;
