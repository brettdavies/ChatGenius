import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@auth': resolve(__dirname, './src/auth'),
      '@constants': resolve(__dirname, './src/constants'),
      '@routes': resolve(__dirname, './src/routes'),
      '@utils': resolve(__dirname, './src/utils'),
      '@config': resolve(__dirname, './src/config'),
      '@db': resolve(__dirname, './src/db'),
      '@types': resolve(__dirname, './src/types'),
      '@services': resolve(__dirname, './src/services'),
      '@middleware': resolve(__dirname, './src/middleware')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      external: [
        'express',
        'express-rate-limit',
        'express-session',
        'passport',
        'passport-local',
        'cookie-parser',
        'cors',
        'helmet',
        'jsonwebtoken',
        'bcryptjs',
        'pg',
        'dotenv'
      ]
    }
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/app.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild'
    })
  ],
  optimizeDeps: {
    exclude: ['fsevents']
  }
}); 