  /// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    deps: {
      inline: ["@fastify/autoload"],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})