import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import enrollmentReducer from './slices/enrollmentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        enrollment: enrollmentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

