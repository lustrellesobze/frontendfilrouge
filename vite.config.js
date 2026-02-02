import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                app: path.resolve(__dirname, './src/app.jsx'),
            },
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
                configure: (proxy) => {
                    proxy.on('error', (err, req, res) => {
                        console.warn('[Vite proxy] Backend injoignable sur 127.0.0.1:8000 — avez-vous lancé "npm run dev" dans le dossier backend ?', err.message);
                    });
                },
            },
            '/socket.io': {
                target: 'http://127.0.0.1:8000',
                ws: true,
            },
        },
    },
});

