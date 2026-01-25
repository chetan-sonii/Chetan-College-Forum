import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        plugins: [react()],
        server: {
            port: 3000, // Keep port 3000 to match your Server's CORS config
            open: true,
        },
        build: {
            outDir: 'build', // Keeps the output folder name consistent with CRA
        },
    };
});