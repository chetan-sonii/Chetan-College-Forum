import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        server: {
            port: 3000, // <--- Add this to match your Server's expected origin
            open: true,
        },
        plugins: [react()],
    };
});