import axiosClient from "./axiosClient";

const postApi = {
    upPostWithImages: async (formData) => {
        return axiosClient.post("/api/posts/up_with_images", formData);
    },

    updatePost: async (id, body) => {
        return axiosClient.put(`/api/posts/${id}`, body);
    },

    upPostNoImages: async (body) => {
        return axiosClient.post("/api/posts/up_no_images", body, {
            headers: { "Content-type": "application/json" },
        });
    },

    getPosts: async (params) => {
        return axiosClient.get("/api/posts/all", { params });
    },

    getPostsByTag: async (tagName, params) => {
        return axiosClient.get(`/api/posts/tag/${tagName}`, { params });
    },

    getPostById: async (post_id) => {
        return axiosClient.get(`/api/posts/${post_id}`);
    },

    getCommentsByPost: async (post_id, params) => {
        return axiosClient.get(`/api/posts/${post_id}/comments`, { params });
    },

    postNewComment: async (post_id, data) => {
        return axiosClient.post(`/api/posts/${post_id}/comment`, data);
    },

    likePost: async (post_id) => {
        return axiosClient.put(`/api/posts/${post_id}/like`);
    },

    unlikePost: async (post_id) => {
        return axiosClient.put(`/api/posts/${post_id}/unlike`);
    },

    checkLiked: async (post_id) => {
        return axiosClient.get(`/api/posts/${post_id}/liked/check`);
    },

    getLikedPosts: async () => {
        return axiosClient.get("/api/posts/liked");
    },

    getMyPosts: async () => {
        return axiosClient.get("/api/posts/me");
    },

    getPostUserById: async (userID) => {
        return axiosClient.get("/api/posts/user/" + userID);
    },

    deletePost: async (postId) => {
        return axiosClient.delete(`/api/posts/${postId}/delete`);
    },

    deleteComment: async (commentId) => {
        return axiosClient.delete(`/api/posts/comment/${commentId}`);
    },

    searchPosts: async (params) => {
        return axiosClient.get("/api/posts/search", { params });
    },
};

export default postApi;
