import api from './api';

export const enrollmentService = {
    getAll: async () => {
        const response = await api.get('/enrollments');
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/enrollments/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/enrollments', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/enrollments/${id}`, data);
        return response.data;
    },

    autoSave: async (step, data) => {
        const response = await api.post('/enrollments/auto-save', {
            step,
            data,
        });
        return response.data;
    },

    submit: async (id) => {
        const response = await api.post(`/enrollments/${id}/submit`);
        return response.data;
    },

    downloadPDF: async (id) => {
        const response = await api.get(`/enrollments/${id}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

