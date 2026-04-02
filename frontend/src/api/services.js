import api from './axios';

export const authService = {
    login: (data) => api.post('/api/auth/login', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
    register: (data) => api.post('/api/auth/register', data),
};

export const ideaService = {
    getIdeas: () => api.get('/api/ideas/'),
    createIdea: (data) => api.post('/api/ideas/', data),
    updateIdea: (id, data) => api.put(`/api/ideas/${id}`, data),
    deleteIdea: (id) => api.delete(`/api/ideas/${id}`),
    getIdeaById: async (id) => {
        const res = await api.get('/api/ideas/');
        const idea = res.data.find(i => i.id === id);
        if (!idea) throw new Error('Idea no encontrada');
        return { data: idea };
    },
    updateStatus: (ideaId, status) => api.put(`/api/ideas/${ideaId}/status`, { status }),
    comentarIdea: (ideaId, content) => api.post(`/api/ideas/${ideaId}/comments`, { content }),
    deleteComment: (commentId) => api.delete(`/api/ideas/comments/${commentId}`)
};

export const projectService = {
    crearProyecto: (ideaId, data) => api.post(`/api/ideas/${ideaId}/projects`, data),
    votarProyecto: (ideaId, projectId) => api.post(`/api/ideas/${ideaId}/projects/${projectId}/vote`),
    actualizarProyecto: (ideaId, projectId, data) => api.patch(`/api/ideas/${ideaId}/projects/${projectId}`, data),
    eliminarProyecto: (ideaId, projectId) => api.delete(`/api/ideas/${ideaId}/projects/${projectId}`),
};

export const aiService = {
    generarIdeas: (categoria, descripcion) => api.post('/api/ai/generar', { categoria, descripcion }),
    enriquecerIdea: (titulo, descripcion) => api.post('/api/ai/enriquecer', { titulo, descripcion }),
};

export const adminService = {
    getMetrics: () => api.get('/api/dashboard/'),
};