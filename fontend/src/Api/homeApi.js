import axiosClient from "./axiosClient";

const homeApi = {

    getTag : async (params) => {
        return axiosClient.get('api/tags',{params})
    },

    getUserInfo: async () => {
        return axiosClient.get('/api/users/info')
    },

    getUniverSities: async () => {
        return axiosClient.get('/api/university/all')
    }
}

export default homeApi