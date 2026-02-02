import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password, quitus_number }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                quitus_number,
            });
            
            // Stocker le token
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            return response.data;
        } catch (error) {
            // Extraire le message d'erreur spécifique
            const errorMessage = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Erreur de connexion';
            
            return rejectWithValue(errorMessage);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            return response.data;
        } catch (error) {
            console.error('Erreur d\'inscription (authSlice):', error);
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Erreur d\'inscription';
            console.error('Message d\'erreur:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
});

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return rejectWithValue('Non authentifié');
        }
    }
);

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Logout
        builder
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });

        // Get Current User
        builder
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload.user || action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

