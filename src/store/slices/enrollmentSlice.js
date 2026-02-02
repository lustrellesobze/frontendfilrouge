import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchEnrollments = createAsyncThunk(
    'enrollment/fetchEnrollments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/enrollments');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement'
            );
        }
    }
);

export const createEnrollment = createAsyncThunk(
    'enrollment/create',
    async (enrollmentData, { rejectWithValue }) => {
        try {
            const response = await api.post('/enrollments', enrollmentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la création'
            );
        }
    }
);

export const autoSaveEnrollment = createAsyncThunk(
    'enrollment/autoSave',
    async ({ step, data }, { rejectWithValue }) => {
        try {
            const response = await api.post('/enrollments/auto-save', {
                step,
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la sauvegarde'
            );
        }
    }
);

export const submitEnrollment = createAsyncThunk(
    'enrollment/submit',
    async (enrollmentId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/enrollments/${enrollmentId}/submit`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la soumission'
            );
        }
    }
);

export const fetchEnrollment = createAsyncThunk(
    'enrollment/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/enrollments/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement'
            );
        }
    }
);

const initialState = {
    enrollments: [],
    currentEnrollment: null,
    loading: false,
    saving: false,
    error: null,
    lastSaved: null,
};

const enrollmentSlice = createSlice({
    name: 'enrollment',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentEnrollment: (state, action) => {
            state.currentEnrollment = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Enrollments
        builder
            .addCase(fetchEnrollments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEnrollments.fulfilled, (state, action) => {
                state.loading = false;
                state.enrollments = action.payload.data || action.payload;
            })
            .addCase(fetchEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Auto Save
        builder
            .addCase(autoSaveEnrollment.pending, (state) => {
                state.saving = true;
            })
            .addCase(autoSaveEnrollment.fulfilled, (state, action) => {
                state.saving = false;
                state.lastSaved = action.payload.saved_at;
                if (action.payload.enrollment) {
                    state.currentEnrollment = action.payload.enrollment;
                }
            })
            .addCase(autoSaveEnrollment.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // Submit
        builder
            .addCase(submitEnrollment.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitEnrollment.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEnrollment = action.payload;
            })
            .addCase(submitEnrollment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch One
        builder
            .addCase(fetchEnrollment.fulfilled, (state, action) => {
                state.currentEnrollment = action.payload;
            });
    },
});

export const { clearError, setCurrentEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

