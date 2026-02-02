import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de base de l'API (VITE_API_URL en prod si front et API sur des hôtes différents)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Gestion des erreurs HTTP
        if (error.response) {
            const { status, data } = error.response;

            // Erreur 401 : Non authentifié
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Utiliser window.location.href seulement si nécessaire, sinon laisser React Router gérer
                if (!window.location.pathname.startsWith('/auth/login')) {
                    window.location.href = '/auth/login';
                }
                toast.error('Session expirée. Veuillez vous reconnecter.');
            }

            // Erreur 403 : Accès refusé
            if (status === 403) {
                toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
            }

            // Erreur 422 : Erreur de validation
            if (status === 422) {
                const errors = data.errors || {};
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                }
            }

            // Erreur 500 : Erreur serveur
            if (status >= 500) {
                toast.error('Une erreur serveur est survenue. Veuillez réessayer plus tard.');
            }
        } else if (error.request) {
            // Pas de réponse = backend injoignable (souvent backend non démarré)
            toast.error(
                'Impossible de contacter le serveur. Lancez le backend : ouvrez un terminal, faites "cd backend" puis "npm run dev" (port 8000), puis réessayez.',
                { duration: 8000 }
            );
        }

        return Promise.reject(error);
    }
);

export default api;

