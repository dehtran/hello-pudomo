import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: true // Expose server to local network (useful for mobile Wi-Fi testing)
  }
});
