const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
});
